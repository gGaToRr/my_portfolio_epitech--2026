import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import AdminUser
from app.logger import log_error, log_success

security = HTTPBearer(auto_error=False)

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hash sécurisé PBKDF2-HMAC-SHA256 standard natif Python."""
    if not salt:
        salt = secrets.token_hex(16)
    iterations = 100_000
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations
    ).hex()
    return f"{salt}${hashed}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Vérifie si le mot de passe correspond au hash stocké."""
    try:
        salt, hashed = stored_hash.split('$', 1)
        test_hash = hash_password(plain_password, salt)
        return secrets.compare_digest(test_hash, stored_hash)
    except Exception as e:
        log_error("auth.py", "verify_password", f"Erreur lors de la vérification du mot de passe: {str(e)}")
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Génère un token JWT signé."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> AdminUser:
    """Dépendance FastAPI pour protéger les routes Admin."""
    if not credentials:
        log_error("auth.py", "get_current_admin", "Accès refusé (401) : Token d'authentification Bearer manquant")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'authentification manquant",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            log_error("auth.py", "get_current_admin", "Accès refusé (401) : Payload token JWT sans 'sub'")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError as e:
        log_error("auth.py", "get_current_admin", f"Accès refusé (401) : Token JWT invalide ou expiré ({str(e)})")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if user is None:
        log_error("auth.py", "get_current_admin", f"Accès refusé (401) : Utilisateur '{username}' inexistant dans la base")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
