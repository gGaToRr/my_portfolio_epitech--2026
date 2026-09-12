import secrets
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser
from app.schemas import LoginRequest, Token, ChangePasswordRequest
from app.auth import verify_password, create_access_token, get_current_admin, hash_password
from app.config import settings
from app.logger import log_success, log_error, log_warning
from app.security import RateLimiter, get_client_ip, sanitize_log_value

router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])

# Protection anti brute-force sur /login (max 5 tentatives par tranche de 10 minutes).
#
# Le compteur est désormais indexé sur `ip|username` et non plus sur la seule
# IP lue dans X-Forwarded-For : cet en-tête est envoyé par le client, il
# suffisait donc de le changer à chaque requête pour repartir de zéro et
# essayer des mots de passe indéfiniment. get_client_ip() n'accorde plus de
# confiance à cet en-tête sauf derrière un proxy déclaré, et la double clé
# limite en plus le bourrage d'identifiants sur un même compte.
LOGIN_MAX_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 10 * 60
login_limiter = RateLimiter(LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_SECONDS, name="login")

# Même logique pour /password : la route exige déjà une session valide, mais
# une session volée (cookie intercepté, poste laissé ouvert) ne doit pas
# permettre de deviner le mot de passe actuel par force brute pour autant.
CHANGE_PASSWORD_MAX_ATTEMPTS = 5
CHANGE_PASSWORD_WINDOW_SECONDS = 10 * 60
change_password_limiter = RateLimiter(
    CHANGE_PASSWORD_MAX_ATTEMPTS, CHANGE_PASSWORD_WINDOW_SECONDS, name="change_password"
)

def _rate_limit_key(client_ip: str, username: str) -> str:
    return f"{client_ip}|{username}"

def check_login_rate_limit(client_ip: str, username: str = ""):
    """Lève un 429 si la fenêtre courante est saturée pour ce couple IP/compte."""
    remaining = login_limiter.check(_rate_limit_key(client_ip, username))
    if remaining is not None:
        log_warning("auth.py", "check_login_rate_limit", f"Brute force bloqué pour IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Trop de tentatives de connexion échouées. Réessayez dans {remaining} secondes."
        )

def record_failed_login(client_ip: str, username: str = ""):
    total = login_limiter.hit(_rate_limit_key(client_ip, username))
    log_warning("auth.py", "record_failed_login", f"Tentative échouée enregistrée pour IP {client_ip} (Total: {total})")

def record_successful_login(client_ip: str, username: str = ""):
    login_limiter.reset(_rate_limit_key(client_ip, username))

@router.post("/login", response_model=Token)
def login_admin(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    client_ip = get_client_ip(request)

    check_login_rate_limit(client_ip, payload.username)

    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()

    # Si l'utilisateur n'existe pas encore et que le mot de passe matche celui du .env (initialisation facile).
    # compare_digest plutôt que == : la comparaison de chaînes s'arrête au
    # premier caractère différent et laisse fuiter la longueur du préfixe
    # correct par le temps de réponse.
    is_bootstrap_login = (
        secrets.compare_digest(payload.username, settings.ADMIN_USERNAME)
        and secrets.compare_digest(payload.password, settings.ADMIN_PASSWORD)
    )
    if not user and is_bootstrap_login:
        from app.auth import hash_password
        user = AdminUser(
            username=settings.ADMIN_USERNAME,
            hashed_password=hash_password(settings.ADMIN_PASSWORD)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        log_success("auth.py", "login_admin", f"Compte administrateur '{settings.ADMIN_USERNAME}' initialisé avec succès")

    if not user or not verify_password(payload.password, user.hashed_password):
        record_failed_login(client_ip, payload.username)
        # Le nom d'utilisateur vient du client : on le neutralise avant de
        # l'écrire dans le log, sinon un saut de ligne suffit à y injecter une
        # fausse entrée (par exemple une connexion réussie qui n'a pas eu lieu).
        log_error("auth.py", "login_admin", f"Échec d'authentification pour '{sanitize_log_value(payload.username, 60)}' (IP: {client_ip})")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects."
        )

    record_successful_login(client_ip, payload.username)
    access_token = create_access_token(data={"sub": user.username})
    # Jeton posé en cookie HttpOnly : le JavaScript ne peut plus le lire, donc une
    # éventuelle XSS ne peut plus l'exfiltrer. SameSite=Strict protège du CSRF
    # (front et API sont same-origin, via nginx en prod et le proxy CRA en dev).
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="strict",
        path="/",
    )
    log_success("auth.py", "login_admin", f"Connexion réussie pour l'administrateur '{user.username}' (IP: {client_ip})")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }

@router.get("/me")
def get_me(current_admin: AdminUser = Depends(get_current_admin)):
    log_success("auth.py", "get_me", f"Session admin validée pour '{current_admin.username}'")
    return {
        "status": "ok",
        "username": current_admin.username,
        "authenticated": True
    }

@router.post("/logout")
def logout_admin(response: Response):
    """Efface le cookie de session. Sans jeton en localStorage, la déconnexion
    côté serveur devient nécessaire pour invalider la session du navigateur."""
    response.delete_cookie(settings.COOKIE_NAME, path="/")
    log_success("auth.py", "logout_admin", "Déconnexion admin : cookie de session effacé")
    return {"status": "ok"}

@router.post("/password")
def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Change le mot de passe de l'administrateur connecté.

    Exige le mot de passe actuel même si la session est déjà authentifiée :
    sans ce contrôle, un cookie de session intercepté (ou un poste laissé
    ouvert) suffirait à changer le mot de passe et verrouiller le vrai
    titulaire du compte hors de son propre panel.
    """
    client_ip = get_client_ip(request)
    limiter_key = _rate_limit_key(client_ip, current_admin.username)

    remaining = change_password_limiter.check(limiter_key)
    if remaining is not None:
        log_warning("auth.py", "change_password", f"Changement de mot de passe bloqué (rate limit) pour IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Trop de tentatives. Réessayez dans {remaining} secondes."
        )

    if not verify_password(payload.current_password, current_admin.hashed_password):
        change_password_limiter.hit(limiter_key)
        log_error("auth.py", "change_password", f"Échec de changement de mot de passe pour '{current_admin.username}' (mot de passe actuel incorrect, IP: {client_ip})")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mot de passe actuel incorrect."
        )

    if payload.new_password == payload.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nouveau mot de passe doit être différent de l'actuel."
        )

    change_password_limiter.reset(limiter_key)
    current_admin.hashed_password = hash_password(payload.new_password)
    db.commit()
    log_success("auth.py", "change_password", f"Mot de passe changé avec succès pour '{current_admin.username}' (IP: {client_ip})")
    return {"success": True, "message": "Mot de passe mis à jour."}
