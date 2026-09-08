import time
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AdminUser
from app.schemas import LoginRequest, Token
from app.auth import verify_password, create_access_token, get_current_admin
from app.config import settings

router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])

# Protection anti brute-force sur /login (max 5 tentatives par tranche de 10 minutes)
login_attempts = {}
LOGIN_MAX_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 10 * 60

def check_login_rate_limit(client_ip: str):
    now = time.time()
    record = login_attempts.get(client_ip)
    if record:
        first_time, count = record
        if now - first_time > LOGIN_WINDOW_SECONDS:
            login_attempts.pop(client_ip, None)
        elif count >= LOGIN_MAX_ATTEMPTS:
            remaining = int(LOGIN_WINDOW_SECONDS - (now - first_time))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Trop de tentatives de connexion échouées. Réessayez dans {remaining} secondes."
            )

def record_failed_login(client_ip: str):
    now = time.time()
    record = login_attempts.get(client_ip)
    if not record or (now - record[0] > LOGIN_WINDOW_SECONDS):
        login_attempts[client_ip] = (now, 1)
    else:
        login_attempts[client_ip] = (record[0], record[1] + 1)

def record_successful_login(client_ip: str):
    login_attempts.pop(client_ip, None)

@router.post("/login", response_model=Token)
def login_admin(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "unknown")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    check_login_rate_limit(client_ip)

    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
    
    # Si l'utilisateur n'existe pas encore et que le mot de passe matche celui du .env (initialisation facile)
    if not user and payload.username == settings.ADMIN_USERNAME and payload.password == settings.ADMIN_PASSWORD:
        from app.auth import hash_password
        user = AdminUser(
            username=settings.ADMIN_USERNAME,
            hashed_password=hash_password(settings.ADMIN_PASSWORD)
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user or not verify_password(payload.password, user.hashed_password):
        record_failed_login(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects."
        )

    record_successful_login(client_ip)
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }

@router.get("/me")
def get_me(current_admin: AdminUser = Depends(get_current_admin)):
    return {
        "status": "ok",
        "username": current_admin.username,
        "authenticated": True
    }
