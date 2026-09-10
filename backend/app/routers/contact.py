import smtplib
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.config import settings
from app.database import get_db
from app.models import ContactMessage, AdminUser
from app.schemas import ContactRequest, ContactMessageOut
from app.auth import get_current_admin
from app.logger import log_success, log_error, log_warning

router = APIRouter(tags=["Contact"])

# Rate limit simple en mémoire
rate_limit_map = {}
RATE_LIMIT_WINDOW = 10 * 60  # 10 minutes
RATE_LIMIT_MAX = 5

def is_rate_limited(ip: str) -> bool:
    now = time.time()
    record = rate_limit_map.get(ip)
    if not record or (now - record["first_request"]) > RATE_LIMIT_WINDOW:
        rate_limit_map[ip] = {"count": 1, "first_request": now}
        return False
    
    if record["count"] >= RATE_LIMIT_MAX:
        log_warning("contact.py", "is_rate_limited", f"Limite d'envoi de messages atteinte pour l'IP {ip}")
        return True
    
    record["count"] += 1
    return False

@router.get("/api/health")
def healthcheck():
    is_smtp_ready = bool(
        settings.SMTP_HOST and
        settings.SMTP_USER and
        settings.SMTP_PASS and
        "ton_mot_de_passe" not in settings.SMTP_PASS
    )
    log_success("contact.py", "healthcheck", f"Healthcheck exécuté (SMTP Configuré: {is_smtp_ready})")
    return {
        "status": "ok",
        "smtpConfigured": is_smtp_ready,
        "receiver": settings.CONTACT_RECEIVER_EMAIL,
        "framework": "FastAPI (Python)"
    }

@router.post("/api/contact")
def send_contact_message(payload: ContactRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "unknown")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    if is_rate_limited(client_ip):
        log_error("contact.py", "send_contact_message", f"Rejet du message - Rate limit actif pour IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Trop de requêtes. Veuillez patienter quelques minutes avant de réécrire."
        )

    # Protection bot honeypot
    if payload.botcheck:
        log_warning("contact.py", "send_contact_message", f"Bot spam honeypot intercepté (IP: {client_ip})")
        return {"success": True, "message": "Message envoyé."}

    name = payload.name.strip()[:80]
    email = payload.email.strip()[:120]
    phone = (payload.phone or "Non renseigné").strip()[:32]
    msg = payload.message.strip()[:4000]

    if not name or not email or not msg:
        log_error("contact.py", "send_contact_message", f"Rejet du message - Validation échouée (champs requis vides, IP: {client_ip})")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tous les champs requis doivent être remplis.")

    # Enregistrement en base SQLite
    try:
        new_msg = ContactMessage(
            name=name,
            email=email,
            phone=phone,
            message=msg,
            client_ip=client_ip,
            is_read=False,
        )
        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)
    except Exception as db_err:
        log_error("contact.py", "send_contact_message", f"Erreur enregistrement message DB: {db_err}")

    is_smtp_ready = bool(
        settings.SMTP_HOST and
        settings.SMTP_USER and
        settings.SMTP_PASS and
        "ton_mot_de_passe" not in settings.SMTP_PASS
    )

    if is_smtp_ready:
        try:
            mime_msg = MIMEMultipart("alternative")
            mime_msg["Subject"] = f"[Portfolio] Nouveau message de {name}"
            mime_msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
            mime_msg["To"] = settings.CONTACT_RECEIVER_EMAIL
            mime_msg["Reply-To"] = email

            text_content = f"Nom: {name}\nEmail: {email}\nTéléphone: {phone}\n\nMessage:\n{msg}"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #61dafb; margin-top: 0;">Nouveau message depuis le portfolio</h2>
                <p><strong>Nom :</strong> {name}</p>
                <p><strong>Email :</strong> <a href="mailto:{email}">{email}</a></p>
                <p><strong>Téléphone :</strong> {phone}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p><strong>Message :</strong></p>
                <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 6px;">{msg}</p>
            </div>
            """
            mime_msg.attach(MIMEText(text_content, "plain"))
            mime_msg.attach(MIMEText(html_content, "html"))

            if settings.SMTP_SECURE or settings.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
                server.starttls()
            
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.send_message(mime_msg)
            server.quit()
            log_success("contact.py", "send_contact_message", f"Email envoyé avec succès via SMTP de '{name}' <{email}>")
        except Exception as e:
            log_error("contact.py", "send_contact_message", f"Erreur critique lors de l'envoi SMTP: {str(e)}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erreur lors de l'envoi de l'email.")
    else:
        log_success("contact.py", "send_contact_message", f"Message local reçu avec succès de '{name}' <{email}> (Tél: {phone})")

    return {"success": True, "message": "Votre message a bien été envoyé !"}

# -------------------------------------------------------------
# Admin Endpoints pour la gestion des messages de contact
# -------------------------------------------------------------
@router.get("/api/admin/messages", response_model=List[ContactMessageOut])
def get_contact_messages(
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    messages = db.query(ContactMessage).order_by(desc(ContactMessage.created_at)).all()
    log_success("contact.py", "get_contact_messages", f"{len(messages)} messages consultés par '{admin.username}'")
    return messages

@router.patch("/api/admin/messages/{message_id}/read", status_code=status.HTTP_200_OK)
def mark_message_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message introuvable.")
    msg.is_read = not msg.is_read
    db.commit()
    return {"success": True, "is_read": msg.is_read}

@router.delete("/api/admin/messages/{message_id}", status_code=status.HTTP_200_OK)
def delete_contact_message(
    message_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message introuvable.")
    db.delete(msg)
    db.commit()
    log_success("contact.py", "delete_contact_message", f"Message ID {message_id} supprimé par '{admin.username}'")
    return {"success": True, "message": "Message supprimé."}

