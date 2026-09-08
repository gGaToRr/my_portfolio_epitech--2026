from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.seed import seed_db
from app.routers import auth, projects, analytics, contact

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Démarrage : Création des tables SQLite et peuplement initial
    Base.metadata.create_all(bind=engine)
    seed_db()
    print("🚀 FastAPI Portfolio Backend prêt !")
    print(f"   Documentation Swagger UI : http://localhost:{settings.API_PORT}/docs")
    yield

app = FastAPI(
    title="Pierre Portfolio API & Analytics",
    description="Backend léger FastAPI pour la gestion des cartes projets, analytics et contact.",
    version="1.2.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
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
allowed_origins = [orig.strip() for orig in settings.CORS_ORIGINS.split(",") if orig.strip()]
if "*" in allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins + ["http://localhost:3006", "http://localhost:3000", "http://127.0.0.1:3006", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Inclusion des routes
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(analytics.router)
app.include_router(contact.router)

@app.get("/")
def root():
    return {
        "app": "Pierre Portfolio API",
        "docs": "/docs",
        "status": "healthy"
    }
