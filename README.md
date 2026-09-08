# Portfolio — Pierre Untersinger (Epitech 2026 / Promo 2028)

Portfolio personnel interactif développé en **React 19** + **FastAPI (Python)** avec base **SQLite**, animations 3D **Vanta.js / Three.js**, gestion du thème sombre/clair, **Dashboard Admin** (`/admin`) et suivi **Analytique RGPD-friendly**.

---

## 🚀 Démarrage rapide en développement

### 1. Lancer le Backend FastAPI (Python)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.seed   # Crée et peuple la base SQLite si nécessaire
uvicorn app.main:app --reload --port 5001
```
- **API & Docs Swagger interactifs** : [http://localhost:5001/docs](http://localhost:5001/docs)

### 2. Lancer le Frontend React
Dans un second terminal :
```bash
cd portfolio-v1.2.0/portfo
npm install
npm start
```
- **Site Portfolio** : [http://localhost:3006](http://localhost:3006)
- **Dashboard Admin & Analytics** : [http://localhost:3006/admin](http://localhost:3006/admin)
  - Identifiants par défaut : `admin` / `admin123` (configurables dans `.env.local`)

---

## 🐳 Déploiement avec Docker Compose

Pour lancer l'ensemble (Frontend + Backend FastAPI + persistance SQLite) en une seule commande :
```bash
docker compose up -d --build
```
Les données SQLite sont automatiquement persistées dans le volume `./backend/data`.

---

## 🛠️ Stack technique

- **Frontend** : React 19, React Router v7, Tokens CSS personnalisés (Thèmes Dark/Light), Vanta.js & Three.js
- **Backend** : Python 3.11+ / FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.0
- **Base de données** : SQLite (persistance sans configuration)
- **Sécurité** : JWT (JSON Web Tokens), Hash PBKDF2-SHA256, Protection brute force
- **Analytics** : Collecte anonymisée RGPD (pages vues, referrers, appareils, clics) sans cookies tiers
- **Conteneurisation** : Docker & Docker Compose multi-services