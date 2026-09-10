import html
import smtplib
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
from app.security import RateLimiter, get_client_ip, sanitize_log_value

router = APIRouter(tags=["Contact"])

# Rate limit partagé (voir app/security.py). L'implémentation locale précédente
# ne purgeait jamais ses entrées expirées : le dictionnaire grossissait à chaque
# nouvelle IP rencontrée.
RATE_LIMIT_WINDOW = 10 * 60  # 10 minutes
RATE_LIMIT_MAX = 5
contact_limiter = RateLimiter(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW, name="contact")

def is_rate_limited(ip: str) -> bool:
    if contact_limiter.check(ip) is not None:
        log_warning("contact.py", "is_rate_limited", f"Limite d'envoi de messages atteinte pour l'IP {ip}")
        return True
    contact_limiter.hit(ip)
    return False

def is_smtp_configured() -> bool:
    """
    Indique si un vrai serveur SMTP est joignable.

    Ce calcul était dupliqué mot pour mot entre le healthcheck et l'envoi, et la
    détection du mot de passe factice était codée en dur sur la seule chaîne
    française du fichier .env.example. Les marqueurs sont maintenant dans la
    configuration.
    """
    if not (settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASS):
        return False
    markers = [m.strip() for m in settings.SMTP_PLACEHOLDER_MARKERS.split(",") if m.strip()]
    return not any(marker in settings.SMTP_PASS for marker in markers)

@router.get("/api/health")
def healthcheck():
    """
    Sonde publique. Volontairement muette sur la configuration : la version
    précédente renvoyait l'adresse e-mail de destination (récoltable par un
    robot de spam) et l'état SMTP, qui renseigne un attaquant sur la surface
    disponible. Le détail est resté disponible sur /api/admin/health.
    """
    return {"status": "ok", "framework": "FastAPI (Python)"}

@router.get("/api/admin/health")
def admin_healthcheck(admin: AdminUser = Depends(get_current_admin)):
    """Détail de la configuration de contact, réservé à l'administrateur."""
    smtp_ready = is_smtp_configured()
    log_success("contact.py", "admin_healthcheck", f"Healthcheck détaillé consulté par '{admin.username}' (SMTP Configuré: {smtp_ready})")
    return {
        "status": "ok",
        "smtpConfigured": smtp_ready,
        "receiver": settings.CONTACT_RECEIVER_EMAIL,
        "framework": "FastAPI (Python)"
    }

@router.post("/api/contact")
def send_contact_message(payload: ContactRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = get_client_ip(request)

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

    # `strip()` ne retire que les espaces de début et de fin : un saut de ligne
    # au milieu de l'adresse survivait et faisait échouer la sérialisation des
    # en-têtes SMTP (HeaderParseError -> HTTP 500, message perdu).
    name = sanitize_log_value(payload.name, 80)
    email = sanitize_log_value(payload.email, 120)
    phone = sanitize_log_value(payload.phone or "Non renseigné", 32)
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
        # Sans rollback, la session reste inutilisable jusqu'à sa fermeture.
        db.rollback()
        log_error("contact.py", "send_contact_message", f"Erreur enregistrement message DB: {db_err}")

    if is_smtp_configured():
        try:
            mime_msg = MIMEMultipart("alternative")
            mime_msg["Subject"] = f"[Portfolio] Nouveau message de {name}"
            mime_msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
            mime_msg["To"] = settings.CONTACT_RECEIVER_EMAIL
            mime_msg["Reply-To"] = email

            text_content = f"Nom: {name}\nEmail: {email}\nTéléphone: {phone}\n\nMessage:\n{msg}"

            # Échappement obligatoire : ces quatre champs viennent d'un
            # formulaire public. Interpolés bruts, ils permettaient d'insérer un
            # lien cliquable dans un e-mail qui semble venir de son propre site,
            # soit un vecteur de phishing visant le destinataire. La partie
            # text/plain, elle, n'interprète rien et reste inchangée.
            e_name = html.escape(name)
            e_email = html.escape(email)
            e_phone = html.escape(phone)
            e_msg = html.escape(msg)

            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #61dafb; margin-top: 0;">Nouveau message depuis le portfolio</h2>
                <p><strong>Nom :</strong> {e_name}</p>
                <p><strong>Email :</strong> <a href="mailto:{e_email}">{e_email}</a></p>
                <p><strong>Téléphone :</strong> {e_phone}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p><strong>Message :</strong></p>
                <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 6px;">{e_msg}</p>
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

