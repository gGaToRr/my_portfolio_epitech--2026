from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Request, status, Query
from pydantic import BaseModel
from app.config import settings
from app.metrics import metrics_tracker
from app.auth import get_current_admin
from app.models import AdminUser
from app.logger import log_success, log_error, get_daily_log_filename
from scripts.log_manager import list_logs_and_archives, archive_previous_month, create_monthly_archive

router = APIRouter(tags=["Status & Uptime"])

class BugReportRequest(BaseModel):
    error_type: str = "FrontendError"
    message: str
    path: Optional[str] = "/"
    stack: Optional[str] = None

@router.get("/status")
@router.get("/api/status")
def get_system_status():
    """Retourne l'état du système, l'uptime précis, les métriques requêtes/erreurs et les composants."""
    summary = metrics_tracker.get_status_summary()
    log_success("status.py", "get_system_status", f"Statut consulté : {summary['status']} (Uptime: {summary['uptime_human']})")
    return summary

@router.post("/api/bugs/report", status_code=status.HTTP_201_CREATED)
def report_client_bug(payload: BugReportRequest, request: Request):
    """Enregistre un bug/erreur client remonté depuis le frontend."""
    client_ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "unknown")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    metrics_tracker.record_bug(
        error_type=payload.error_type,
        message=payload.message,
        path=payload.path or "/",
        client_ip=client_ip
    )
    log_error("status.py", "report_client_bug", f"Bug client remonté : [{payload.error_type}] {payload.message} (Page: {payload.path})")
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
    target = logs_dir / (filename if filename else get_daily_log_filename())
    if not target.exists():
        target = Path(settings.LOG_FILE)

    if not target.exists():
        return {"filename": target.name, "lines": [], "total_lines": 0}

    try:
        with open(target, "r", encoding="utf-8", errors="replace") as f:
            all_lines = f.readlines()
        tail_lines = [l.strip() for l in all_lines[-lines:] if l.strip()]
        return {
            "filename": target.name,
            "lines": tail_lines,
            "total_lines": len(all_lines),
            "size_bytes": target.stat().st_size
        }
    except Exception as e:
        return {"filename": target.name, "lines": [f"Erreur lecture logs: {e}"], "total_lines": 0}

@router.get("/api/admin/logs/files")
def get_logs_files_list(_: AdminUser = Depends(get_current_admin)):
    """Retourne la liste des logs quotidiens et des archives .tar.gz."""
    return list_logs_and_archives()

@router.post("/api/admin/logs/archive")
def trigger_log_archive(
    year: Optional[int] = None,
    month: Optional[int] = None,
    _: AdminUser = Depends(get_current_admin)
):
    """Déclenche la compression et l'archivage .tar.gz d'un mois."""
    if year and month:
        res = create_monthly_archive(year, month)
    else:
        res = archive_previous_month()
    return res

