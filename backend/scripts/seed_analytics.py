#!/usr/bin/env python3
"""
Peuple la base de DÉVELOPPEMENT avec un trafic analytics réaliste, pour que
l'écran Analytics (graphiques matplotlib + tableaux) ait de quoi s'afficher.

Pourquoi un générateur plutôt que des lignes en dur : les graphiques ne sont
parlants que sur des distributions cohérentes — un visiteur mobile a un petit
viewport et un OS mobile, le trafic monte en soirée et retombe la nuit, la
plupart des accès sont directs, etc. On génère donc des SESSIONS (un visiteur,
plusieurs pages) et non des vues isolées, pour que « pages par visiteur » et la
carte horaire aient un sens.

Usage (depuis backend/, venv activé) :
    python scripts/seed_analytics.py                 # 30 j, ~25 visiteurs/j, ajoute
    python scripts/seed_analytics.py --days 90 --visitors 30
    python scripts/seed_analytics.py --reset         # vide d'abord les tables analytics

⚠️  DÉV UNIQUEMENT. --reset efface page_views et analytics_events de la base locale.
"""
import argparse
import hashlib
import random
import secrets
from datetime import datetime, timedelta, timezone

import sys, pathlib as _pl
sys.path.insert(0, str(_pl.Path(__file__).resolve().parent.parent))

from app.database import SessionLocal, Base, engine
from app.models import PageView, AnalyticsEvent

# --- Catalogues pondérés (poids relatifs, pas des pourcentages) -------------

PAGES = [
    ("/", 46),
    ("/projects/merci-app", 11),
    ("/projects/portfolio", 9),
    ("/projects/voltaire", 7),
    ("/projects/auris-mp3", 6),
    ("/youtube", 4),
    ("/cv", 3),
    ("/page-inexistante", 2),  # quelques 404 réalistes
]

REFERRERS = [
    (None, 44),                                   # accès direct
    ("https://www.google.com/", 20),
    ("https://www.linkedin.com/", 13),
    ("https://github.com/", 8),
    ("https://t.co/", 4),
    ("https://www.instagram.com/", 6),
    ("https://duckduckgo.com/", 3),
    ("https://www.bing.com/", 2),
]

TIMEZONES = [
    ("Europe/Paris", 64),
    ("Europe/Brussels", 8),
    ("Europe/London", 6),
    ("America/New_York", 6),
    ("Europe/Zurich", 4),
    ("America/Los_Angeles", 3),
    ("Asia/Tokyo", 2),
    ("Africa/Casablanca", 3),
]

# Profils d'appareil cohérents : (device, poids, navigateurs, OS, largeurs)
PROFILS = [
    ("mobile", 42,
     [("Chrome", 6), ("Safari", 5), ("Firefox", 1)],
     [("Android", 5), ("iOS", 5)],
     [(360, 3), (390, 4), (412, 3), (414, 2), (430, 2)]),
    ("desktop", 50,
     [("Chrome", 6), ("Firefox", 3), ("Edge", 2), ("Safari", 2)],
     [("Windows", 6), ("macOS", 4), ("Linux", 2)],
     [(1366, 3), (1440, 3), (1536, 2), (1920, 4), (2560, 1)]),
    ("tablet", 8,
     [("Safari", 4), ("Chrome", 3)],
     [("iOS", 4), ("Android", 2)],
     [(768, 4), (820, 2), (1024, 3)]),
]

# Poids horaires (0h..23h) : creux la nuit, pics midi et 18-22h.
POIDS_HEURE = [2,1,1,1,1,1,2,4,7,9,10,11,12,9,8,8,9,12,15,16,14,10,6,3]
# Poids par jour de semaine (lun..dim) : légère baisse le week-end.
POIDS_JOUR = [10, 10, 10, 10, 11, 7, 6]


def tirage(pairs):
    libelles = [p[0] for p in pairs]
    poids = [p[1] for p in pairs]
    return random.choices(libelles, weights=poids, k=1)[0]


def tirage_profil():
    return random.choices(PROFILS, weights=[p[1] for p in PROFILS], k=1)[0]


def nouveau_hash():
    return hashlib.sha256(secrets.token_bytes(16)).hexdigest()[:24]


def heure_pour(jour):
    h = random.choices(range(24), weights=POIDS_HEURE, k=1)[0]
    return jour.replace(hour=h, minute=random.randint(0, 59),
                        second=random.randint(0, 59), microsecond=0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--visitors", type=int, default=25, help="visiteurs publics/jour (moyenne)")
    ap.add_argument("--reset", action="store_true", help="vide les tables analytics avant (DEV)")
    args = ap.parse_args()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if args.reset:
            n1 = db.query(PageView).delete()
            n2 = db.query(AnalyticsEvent).delete()
            db.commit()
            print(f"[reset] {n1} page_views et {n2} analytics_events supprimés.")

        aujourdhui = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        total_vues = total_visiteurs = total_events = 0

        for decalage in range(args.days - 1, -1, -1):
            jour = aujourdhui - timedelta(days=decalage)
            facteur_jour = POIDS_JOUR[jour.weekday()] / 10.0
            # +tendance douce : trafic un peu plus soutenu vers aujourd'hui.
            tendance = 0.6 + 0.4 * (args.days - decalage) / args.days
            n_visiteurs = max(1, int(random.gauss(args.visitors * facteur_jour * tendance,
                                                   args.visitors * 0.25)))

            for _ in range(n_visiteurs):
                device, _, navs, oss, viewports = tirage_profil()
                navigateur = tirage(navs)
                systeme = tirage(oss)
                viewport = tirage(viewports)
                fuseau = tirage(TIMEZONES)
                langue = random.choices(["fr-FR", "en-US", "en-GB", "fr-BE"],
                                        weights=[70, 15, 8, 7], k=1)[0]
                v_hash = nouveau_hash()
                debut = heure_pour(jour)

                # Session : 1 à 5 pages, penché vers 1-2.
                n_pages = random.choices([1, 2, 3, 4, 5], weights=[45, 28, 15, 8, 4], k=1)[0]
                referrer_entree = tirage(REFERRERS)  # seulement à l'entrée
                total_visiteurs += 1

                for i in range(n_pages):
                    path = "/" if i == 0 and random.random() < 0.55 else tirage(PAGES)
                    horodatage = debut + timedelta(seconds=i * random.randint(20, 240))
                    db.add(PageView(
                        path=path,
                        visitor_hash=v_hash,
                        referrer=referrer_entree if i == 0 else None,
                        device_type=device,
                        browser=navigateur,
                        os=systeme,
                        language=langue,
                        viewport_width=viewport,
                        timezone=fuseau,
                        timestamp=horodatage,
                    ))
                    total_vues += 1

                # Événements : téléchargement CV + clics projets, de temps en temps.
                if random.random() < 0.09:
                    db.add(AnalyticsEvent(
                        event_name="download_cv", target="CV_PIERRE_UNTERSINGER.pdf",
                        path="/", visitor_hash=v_hash,
                        extra_data={"format": "pdf", "browser": navigateur, "os": systeme, "device": device},
                        timestamp=debut + timedelta(seconds=random.randint(30, 300)),
                    ))
                    total_events += 1
                if random.random() < 0.18:
                    slug = random.choice(["merci-app", "portfolio", "voltaire", "auris-mp3"])
                    db.add(AnalyticsEvent(
                        event_name="click_project", target=slug, path="/",
                        visitor_hash=v_hash,
                        extra_data={"browser": navigateur, "os": systeme, "device": device},
                        timestamp=debut + timedelta(seconds=random.randint(20, 200)),
                    ))
                    total_events += 1

            # Quelques vues du panneau admin (le propriétaire), exclues des chiffres publics.
            if random.random() < 0.7:
                v_admin = nouveau_hash()
                for _ in range(random.randint(1, 4)):
                    db.add(PageView(
                        path="/panelAdmin", visitor_hash=v_admin, referrer=None,
                        device_type="desktop", browser="Firefox", os="Linux",
                        language="fr-FR", viewport_width=1920, timezone="Europe/Paris",
                        timestamp=heure_pour(jour),
                    ))

        db.commit()
        print(f"[seed] {args.days} jours · {total_visiteurs} sessions · "
              f"{total_vues} pages vues · {total_events} événements ajoutés.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
