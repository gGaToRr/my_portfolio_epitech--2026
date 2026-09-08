from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel
from app.metrics import metrics_tracker
from app.auth import get_current_admin
from app.models import AdminUser
from app.logger import log_success, log_error

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
