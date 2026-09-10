from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
ARCHIVES_DIR = LOG_DIR / "archives"
ARCHIVES_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    APP_NAME: str = "Portfolio API & Analytics"
    API_PORT: int = 5001
    HOST: str = "0.0.0.0"
    DEBUG: bool = False
    LOG_FILE: str = str(LOG_DIR / "portfolio.log")
    LOG_ARCHIVES_DIR: str = str(ARCHIVES_DIR)

    # Sécurité & Auth Admin
    # Ces identifiants par défaut sont volontaires : le panel admin est une
    # démonstration du portfolio, pas un espace contenant des données sensibles.
    # Ils restent surchargeables par .env.local / .env sur un vrai déploiement.
    SECRET_KEY: str = "portfolio_super_secret_jwt_key_change_me_in_prod_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"

    # Nombre de proxys de confiance placés devant l'application.
    #
    # X-Forwarded-For est un en-tête que le client peut écrire lui-même : le
    # lire sans précaution permettait de se déclarer une IP différente à chaque
    # requête et d'annuler les protections anti-brute-force. Chaque proxy de
    # confiance ajoute une entrée à droite de la liste ; la vraie IP du visiteur
    # est donc la N-ième en partant de la fin, où N est ce réglage.
    #
    #   0 = pas de proxy (défaut, développement) : l'en-tête est ignoré.
    #   2 = déploiement Docker Compose : nginx puis le relais de server.js.
    TRUSTED_PROXY_HOPS: int = 0

    # Documentation OpenAPI : ferme par défaut, car /docs publie l'intégralité
    # du schéma (toutes les routes admin incluses) à qui atteint le port.
    ENABLE_DOCS: bool = False

    # Rotation des fichiers de log (voir logger.py). Sans plafond, portfolio.log
    # grossissait indéfiniment : il n'est jamais repris par l'archivage mensuel.
    LOG_MAX_BYTES: int = 10 * 1024 * 1024  # 10 Mo par fichier
    LOG_BACKUP_COUNT: int = 5

    # Base de données SQLite
    DATABASE_URL: str = f"sqlite:///{DATA_DIR}/portfolio.db"

    # CORS autorisés
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3006,http://localhost:5001,http://127.0.0.1:3000,http://127.0.0.1:3006,http://127.0.0.1:5001"

    # Contact & SMTP
    # Chaîne présente dans les fichiers .env.example : sa présence signale un
    # mot de passe non renseigné, donc une configuration SMTP incomplète.
    SMTP_PLACEHOLDER_MARKERS: str = "ton_mot_de_passe,votre_mot_de_passe,your_password"
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
