import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    APP_NAME: str = "Portfolio API & Analytics"
    API_PORT: int = 5001
    HOST: str = "0.0.0.0"
    DEBUG: bool = False
    LOG_FILE: str = str(LOG_DIR / "portfolio.log")

    # Sécurité & Auth Admin
    SECRET_KEY: str = "portfolio_super_secret_jwt_key_change_me_in_prod_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"  # À changer dans .env.local

    # Base de données SQLite
    DATABASE_URL: str = f"sqlite:///{DATA_DIR}/portfolio.db"

    # CORS autorisés
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3006,http://localhost:5001,http://127.0.0.1:3000,http://127.0.0.1:3006,http://127.0.0.1:5001"

    # Contact & SMTP
    CONTACT_RECEIVER_EMAIL: str = "pierre.untersinger2@gmail.com"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = ""
    SMTP_SECURE: bool = False

    model_config = {
        "env_file": (
            str(BASE_DIR / ".env.local"),
            str(BASE_DIR / ".env"),
            str(BASE_DIR.parent / ".env.local"),
            str(BASE_DIR.parent / ".env"),
        ),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

settings = Settings()
