FROM python:3.11-slim

WORKDIR /app

# Empêcher Python d'écrire des fichiers .pyc et forcer l'affichage direct des logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Installation des dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code source
COPY app ./app

# Création du dossier de persistance des données
RUN mkdir -p /app/data

EXPOSE 5001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5001"]
