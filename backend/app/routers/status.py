from collections import deque
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from pydantic import BaseModel, Field
from app.config import settings
from app.metrics import metrics_tracker
from app.auth import get_current_admin
from app.models import AdminUser
from app.logger import log_success, log_error, get_daily_log_filename, FRENCH_DAYS
from app.security import get_client_ip, public_write_limiter, resolve_inside, sanitize_log_value
from scripts.log_manager import list_logs_and_archives, archive_previous_month, create_monthly_archive

router = APIRouter(tags=["Status & Uptime"])

class BugReportRequest(BaseModel):
    error_type: str = Field(default="FrontendError", max_length=100)
    message: str = Field(max_length=1000)
    path: Optional[str] = Field(default="/", max_length=250)
    stack: Optional[str] = Field(default=None, max_length=4000)

@router.get("/status")
@router.get("/api/status")
def get_system_status():
    """
    Sonde publique réduite.

    La réponse complète contenait les noms/images/ports des conteneurs Docker,
    la version de Python, l'architecture machine et surtout `recent_bugs`, dont
    le champ `client_ip` expose les adresses IP d'autres visiteurs — une donnée
    personnelle, publiée sans authentification. Le détail est passé sur
    /api/admin/status, et seul l'état global reste public (le bandeau d'uptime
    du site n'a besoin de rien d'autre).
    """
    summary = metrics_tracker.get_status_summary()
    return {
        "status": summary["status"],
        "uptime_seconds": summary["uptime_seconds"],
        "uptime_human": summary["uptime_human"],
        "started_at": summary["started_at"],
    }

@router.get("/api/admin/status")
def get_admin_system_status(admin: AdminUser = Depends(get_current_admin)):
    """État système complet : composants, historique d'uptime et bugs récents."""
    summary = metrics_tracker.get_status_summary()
    log_success("status.py", "get_admin_system_status", f"Statut détaillé consulté par '{admin.username}' : {summary['status']} (Uptime: {summary['uptime_human']})")
    return summary

@router.post("/api/bugs/report", status_code=status.HTTP_201_CREATED)
def report_client_bug(payload: BugReportRequest, request: Request):
    """Enregistre un bug/erreur client remonté depuis le frontend."""
    client_ip = get_client_ip(request)
    # Route publique en écriture : elle alimente une liste que consulte
    # l'administrateur, il faut donc plafonner le débit comme sur /api/contact.
    public_write_limiter.enforce(client_ip, "Trop de rapports d'erreur envoyés.")

    metrics_tracker.record_bug(
        error_type=sanitize_log_value(payload.error_type, 100),
        message=sanitize_log_value(payload.message, 500),
        path=sanitize_log_value(payload.path or "/", 250),
        client_ip=client_ip
    )
    # Contenu fourni par le client : neutralisé avant écriture pour éviter
    # l'injection de fausses lignes dans la console de logs.
    log_error("status.py", "report_client_bug", f"Bug client remonté : [{sanitize_log_value(payload.error_type, 60)}] {sanitize_log_value(payload.message, 250)} (Page: {sanitize_log_value(payload.path or '/', 120)})")
    return {"success": True, "message": "Bug enregistré avec succès"}

@router.post("/api/admin/bugs/clear", status_code=status.HTTP_200_OK)
def clear_bugs(_: AdminUser = Depends(get_current_admin)):
    """Efface l'historique des bugs enregistrés (Action Admin)."""
    metrics_tracker.clear_bugs()
    log_success("status.py", "clear_bugs", "Historique des bugs réinitialisé par l'administrateur")
    return {"success": True, "message": "Historique des bugs réinitialisé"}

# ----------------- Logs Console Endpoints -----------------
@router.get("/api/admin/logs/live")
def get_live_logs(
    lines: int = Query(150, ge=10, le=1000),
    filename: Optional[str] = Query(None),
    _: AdminUser = Depends(get_current_admin)
):
    """Retourne les dernières lignes d'un fichier de log."""
    logs_dir = Path(settings.LOG_FILE).parent

    # `logs_dir / filename` n'offrait aucune protection : un chemin absolu
    # remplace entièrement la base (`Path("/app/logs") / "/etc/passwd"` donne
    # "/etc/passwd") et "../" remontait l'arborescence. resolve_inside() ne
    # conserve que le nom de fichier final et revérifie que le résultat est bien
    # sous logs_dir. Un nom refusé retombe sur le log du jour.
    target = resolve_inside(logs_dir, filename) if filename else None
    if target is None:
        if filename:
            log_error("status.py", "get_live_logs", f"Nom de fichier de log refusé : '{sanitize_log_value(filename, 120)}'")
        target = logs_dir / get_daily_log_filename()

    if not target.exists():
        target = Path(settings.LOG_FILE)

    if not target.exists():
        return {"filename": target.name, "lines": [], "total_lines": 0}

    try:
        # deque(maxlen=n) ne conserve que les n dernières lignes en mémoire.
        # `readlines()` chargeait le fichier entier — jusqu'à plusieurs centaines
        # de Mo — pour n'en renvoyer que 150.
        # enumerate() permet de connaître le nombre total de lignes sans les
        # conserver : seul le compteur de la dernière ligne lue est gardé.
        with open(target, "r", encoding="utf-8", errors="replace") as f:
            tail = deque(enumerate(f, start=1), maxlen=lines)
        total_lines = tail[-1][0] if tail else 0
        tail_lines = [l.strip() for _, l in tail if l.strip()]
        return {
            "filename": target.name,
            "lines": tail_lines,
            "total_lines": total_lines,
            "size_bytes": target.stat().st_size
        }
    except Exception as e:
        return {"filename": target.name, "lines": [f"Erreur lecture logs: {e}"], "total_lines": 0}

@router.get("/api/admin/logs/recent-days")
def get_recent_days_logs(
    days: int = Query(5, ge=1, le=14),
    lines_per_day: int = Query(200, ge=10, le=1000),
    _: AdminUser = Depends(get_current_admin)
):
    """
    Retourne les logs et métadonnées pour aujourd'hui et les N derniers jours (par défaut 5 jours).
    Permet un préchargement et une mise en cache fluide côté client.
    """
    logs_dir = Path(settings.LOG_FILE).parent
    now = datetime.now()
    results = []

    for i in range(days):
        day_date = now - timedelta(days=i)
        filename = get_daily_log_filename(day_date)
        target = logs_dir / filename

        if i == 0:
            label = f"Aujourd'hui ({day_date.strftime('%d/%m')})"
        elif i == 1:
            label = f"Hier ({day_date.strftime('%d/%m')})"
        else:
            day_name = FRENCH_DAYS[day_date.weekday()].capitalize()
            label = f"{day_name} ({day_date.strftime('%d/%m')})"

        file_exists = target.exists()
        lines = []
        total_lines = 0
        size_bytes = 0

        if file_exists:
            try:
                # Même lecture bornée que /logs/live : on ne garde en mémoire
                # que les lines_per_day dernières lignes.
                with open(target, "r", encoding="utf-8", errors="replace") as f:
                    tail = deque(enumerate(f, start=1), maxlen=lines_per_day)
                total_lines = tail[-1][0] if tail else 0
                lines = [l.strip() for _, l in tail if l.strip()]
                size_bytes = target.stat().st_size
            except Exception as e:
                lines = [f"Erreur lecture {filename}: {e}"]

        results.append({
            "day_index": i,
            "date": day_date.strftime("%Y-%m-%d"),
            "label": label,
            "filename": filename,
            "exists": file_exists,
            "total_lines": total_lines,
            "size_bytes": size_bytes,
            "lines": lines
        })

    return {
        "days_count": days,
        "days": results,
        "server_time": now.isoformat()
    }

@router.get("/api/admin/logs/files")
def get_logs_files_list(_: AdminUser = Depends(get_current_admin)):
    """Retourne la liste des logs quotidiens et des archives .tar.gz."""
    return list_logs_and_archives()

@router.post("/api/admin/logs/archive")
def trigger_log_archive(
    # Bornés : l'archivage supprime les fichiers qu'il a compressés, une valeur
    # aberrante ne doit pas pouvoir atteindre la sélection de fichiers.
    year: Optional[int] = Query(None, ge=2000, le=2200),
    month: Optional[int] = Query(None, ge=1, le=12),
    _: AdminUser = Depends(get_current_admin)
):
    """Déclenche la compression et l'archivage .tar.gz d'un mois."""
    if year and month:
        res = create_monthly_archive(year, month)
    else:
        res = archive_previous_month()
    return res

