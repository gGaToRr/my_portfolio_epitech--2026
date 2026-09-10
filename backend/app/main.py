import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.seed import seed_db
from app.routers import auth, projects, analytics, contact, status as status_router
from app.logger import log_success, log_error
from app.metrics import metrics_tracker
from app.security import get_client_ip

# Routes interrogées en boucle par le panel admin (sondage toutes les 5 à 12 s).
# Les journaliser créait une boucle auto-alimentée : lire les logs produisait des
# lignes de log, qui grossissaient le fichier relu au tour suivant (~42 Mo/jour
# sans le moindre visiteur). On compte toujours leurs métriques, on n'écrit plus
# une ligne par appel.
LOG_EXCLUDED_PATHS = {
    "/status",
    "/api/status",
    "/api/admin/logs/live",
    "/api/admin/logs/recent-days",
    "/api/admin/logs/files",
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Démarrage : Création des tables SQLite et peuplement initial
    Base.metadata.create_all(bind=engine)
    seed_db()
    log_success("main.py", "lifespan", f"FastAPI Portfolio Backend initialisé sur le port {settings.API_PORT} (Doc: /docs)")
    print("🚀 FastAPI Portfolio Backend prêt !")
    print(f"   Documentation Swagger UI : http://localhost:{settings.API_PORT}/docs")
    yield

# /docs et /redoc publient l'intégralité du schéma OpenAPI, routes admin
# comprises. On ne les expose que si ENABLE_DOCS ou DEBUG est activé.
_docs_enabled = settings.ENABLE_DOCS or settings.DEBUG

app = FastAPI(
    title="Pierre Portfolio API & Analytics",
    description="Backend léger FastAPI pour la gestion des cartes projets, analytics, uptime et contact.",
    version="1.2.0",
    lifespan=lifespan,
    docs_url="/docs" if _docs_enabled else None,
    redoc_url="/redoc" if _docs_enabled else None,
    openapi_url="/openapi.json" if _docs_enabled else None,
)

# HTTP Request Interaction Logging & Metrics Middleware
@app.middleware("http")
async def log_http_requests(request: Request, call_next):
    start_time = time.time()
    client_ip = get_client_ip(request)

    method = request.method
    path = request.url.path
    # Les routes de sondage restent comptées dans les métriques mais ne sont
    # journalisées que si elles échouent (voir LOG_EXCLUDED_PATHS).
    is_polling_route = path in LOG_EXCLUDED_PATHS

    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        status_code = response.status_code

        metrics_tracker.record_request(status_code)

        msg = f"{method} {path} - Statut {status_code} ({duration_ms:.2f}ms) - IP: {client_ip}"
        if status_code >= 500:
            metrics_tracker.record_bug(error_type=f"HTTP_{status_code}", message=f"Erreur serveur {status_code} sur {path}", path=path, client_ip=client_ip)
            log_error("main.py", "http_middleware", msg)
        elif status_code >= 400:
            log_error("main.py", "http_middleware", msg)
        elif not is_polling_route:
            log_success("main.py", "http_middleware", msg)

        return response
    except Exception as exc:
        duration_ms = (time.time() - start_time) * 1000
        metrics_tracker.record_request(500)
        metrics_tracker.record_bug(error_type=type(exc).__name__, message=str(exc), path=path, client_ip=client_ip)
        log_error("main.py", "http_middleware", f"{method} {path} - Exception 500: {str(exc)} ({duration_ms:.2f}ms) - IP: {client_ip}")
        raise exc

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Configuration CORS
#
# Deux corrections par rapport à la version précédente :
#  1. les origines localhost ne sont plus réinjectées inconditionnellement.
#     Elles l'étaient même en production, ce qui annulait silencieusement la
#     liste blanche configurée dans CORS_ORIGINS. Elles ne sont ajoutées que
#     lorsque DEBUG est actif, c'est-à-dire en développement.
#  2. "*" et allow_credentials=True sont incompatibles : la spécification CORS
#     l'interdit, et Starlette contourne en renvoyant l'origine de l'appelant,
#     ce qui revient à autoriser tout le monde. On désactive donc les
#     identifiants quand la liste vaut "*".
allowed_origins = [orig.strip() for orig in settings.CORS_ORIGINS.split(",") if orig.strip()]
LOCAL_DEV_ORIGINS = [
    "http://localhost:3006",
    "http://localhost:3000",
    "http://127.0.0.1:3006",
    "http://127.0.0.1:3000",
]

if "*" in allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    if settings.DEBUG:
        allowed_origins = list(dict.fromkeys(allowed_origins + LOCAL_DEV_ORIGINS))
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Inclusion des routes
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(analytics.router)
app.include_router(contact.router)
app.include_router(status_router.router)

@app.get("/")
def root():
    log_success("main.py", "root", "Interrogation du endpoint racine / (Health check)")
    return {
        "app": "Pierre Portfolio API",
        "docs": "/docs",
        "status": "healthy"
    }
