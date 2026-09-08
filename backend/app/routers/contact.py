import smtplib
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import APIRouter, HTTPException, Request, status
from app.config import settings
from app.schemas import ContactRequest

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
    return {
        "status": "ok",
        "smtpConfigured": is_smtp_ready,
        "receiver": settings.CONTACT_RECEIVER_EMAIL,
        "framework": "FastAPI (Python)"
    }

@router.post("/api/contact")
def send_contact_message(payload: ContactRequest, request: Request):
    client_ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "unknown")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    if is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Trop de requêtes. Veuillez patienter quelques minutes avant de réécrire."
        )

    # Protection bot honeypot
    if payload.botcheck:
        return {"success": True, "message": "Message envoyé."}

    name = payload.name.strip()[:80]
    email = payload.email.strip()[:120]
    phone = (payload.phone or "Non renseigné").strip()[:32]
    msg = payload.message.strip()[:4000]

    if not name or not email or not msg:
        raise HTTPException(status_code=400, detail="Tous les champs requis doivent être remplis.")

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
            print(f"[SMTP Python] Email envoyé avec succès pour {name} ({email})")
        except Exception as e:
            print(f"[SMTP Python Error] {e}")
            raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de l'email.")
    else:
        print("[SMTP Python LOCAL] Mode local simulé — Message reçu :")
        print(f"   De : {name} <{email}> (Tél: {phone})")
        print(f"   Message : {msg}")

    return {"success": True, "message": "Votre message a bien été envoyé !"}
