FROM python:3.11-slim

WORKDIR /app

# Empêcher Python d'écrire des fichiers .pyc et forcer l'affichage direct des logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Installation des dépendances (requirements.txt ne contient plus les outils de
# test : ils sont dans requirements-dev.txt et n'ont rien à faire en production)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code source.
#
# scripts/ est indispensable : app/routers/status.py importe
# scripts.log_manager. Sans ce COPY, l'image levait un ModuleNotFoundError dès
# l'import de app.main — le conteneur ne démarrait pas du tout.
COPY app ./app
COPY scripts ./scripts

# Dossiers de persistance (montés en volume par docker-compose)
RUN mkdir -p /app/data /app/logs/archives

# Exécution sans privilèges plutôt qu'en root.
RUN useradd --create-home --uid 1000 portfolio \
    && chown -R portfolio:portfolio /app
USER portfolio

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:5001/api/health', timeout=3).status == 200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5001"]
