"""
Agrégations de la table page_views pour l'écran Analytics.

Séparées du routeur pour deux raisons : elles sont testables sans passer par
HTTP, et elles alimentent à la fois les graphiques et le tableau de valeurs
affiché sous chacun d'eux.

Un point de méthode : par défaut, les pages du panneau d'administration sont
exclues des statistiques de fréquentation. Elles ne sont visitées que par le
propriétaire du site — les garder gonflait le compteur de « visiteurs » avec sa
propre activité, au point que /panelAdmin représentait l'essentiel du trafic
mesuré. Le décompte de ces pages reste disponible à part.
"""
from datetime import datetime, time, timedelta, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple

from sqlalchemy import func, distinct, desc
from sqlalchemy.orm import Session

from app.models import PageView, AnalyticsEvent

# Préfixes considérés comme « coulisses » et non comme trafic public.
PREFIXES_ADMIN = ("/panelAdmin",)


def _filtre_public(requete):
    """Retire les pages d'administration d'une requête sur page_views."""
    for prefixe in PREFIXES_ADMIN:
        requete = requete.filter(~PageView.path.startswith(prefixe))
    return requete


def _base(db: Session, depuis: datetime, publiques_seulement: bool):
    requete = db.query(PageView).filter(PageView.timestamp >= depuis)
    return _filtre_public(requete) if publiques_seulement else requete


def fenetre(jours: int) -> datetime:
    """Début (00:00 UTC) du jour le plus ancien inclus dans la période.

    Ancrer sur `now() - (jours-1)` sans tronquer à minuit faisait dépendre le
    résultat de l'heure de consultation : ouvert le matin, le tableau de bord
    excluait les visites de la nuit du jour le plus ancien de la période, sous-
    comptant ce jour-là par rapport aux suivants.
    """
    premier_jour = datetime.now(timezone.utc).date() - timedelta(days=jours - 1)
    return datetime.combine(premier_jour, time.min, tzinfo=timezone.utc)


def serie_quotidienne(
    db: Session, jours: int, publiques_seulement: bool = True
) -> Tuple[List[str], List[int], List[int]]:
    """
    Vues et visiteurs uniques par jour, sur `jours` jours consécutifs.

    Les jours sans visite sont conservés à zéro : les omettre transformerait une
    interruption en simple resserrement de la courbe.
    """
    depuis = fenetre(jours)
    lignes = _base(db, depuis, publiques_seulement).with_entities(
        func.date(PageView.timestamp).label("jour"),
        func.count(PageView.id),
        func.count(distinct(PageView.visitor_hash)),
    ).group_by("jour").all()

    par_jour = {str(ligne[0]): (ligne[1], ligne[2]) for ligne in lignes}

    libelles: List[str] = []
    vues: List[int] = []
    visiteurs: List[int] = []
    aujourdhui = datetime.now(timezone.utc).date()
    for decalage in range(jours - 1, -1, -1):
        jour = aujourdhui - timedelta(days=decalage)
        cle = jour.strftime("%Y-%m-%d")
        v, u = par_jour.get(cle, (0, 0))
        libelles.append(jour.strftime("%d/%m"))
        vues.append(v)
        visiteurs.append(u)
    return libelles, vues, visiteurs


def matrice_horaire(
    db: Session, jours: int, publiques_seulement: bool = True
) -> List[List[int]]:
    """Grille 7 jours x 24 heures des pages vues (lundi = 0)."""
    depuis = fenetre(jours)
    matrice = [[0] * 24 for _ in range(7)]

    lignes = _base(db, depuis, publiques_seulement).with_entities(
        PageView.timestamp
    ).all()
    for (horodatage,) in lignes:
        if horodatage is None:
            continue
        matrice[horodatage.weekday()][horodatage.hour] += 1
    return matrice


def _classement(
    db: Session, colonne, jours: int, limite: int, publiques_seulement: bool
) -> List[Tuple[str, int]]:
    depuis = fenetre(jours)
    lignes = _base(db, depuis, publiques_seulement).with_entities(
        colonne, func.count(PageView.id).label("total")
    ).group_by(colonne).order_by(desc("total")).limit(limite).all()
    return [(ligne[0] or "(inconnu)", ligne[1]) for ligne in lignes]


def top_pages(db: Session, jours: int, limite: int = 10, publiques_seulement: bool = True):
    return _classement(db, PageView.path, jours, limite, publiques_seulement)


def top_navigateurs(db: Session, jours: int, limite: int = 6, publiques_seulement: bool = True):
    return _classement(db, PageView.browser, jours, limite, publiques_seulement)


def top_systemes(db: Session, jours: int, limite: int = 6, publiques_seulement: bool = True):
    return _classement(db, PageView.os, jours, limite, publiques_seulement)


def top_fuseaux(db: Session, jours: int, limite: int = 8, publiques_seulement: bool = True):
    return _classement(db, PageView.timezone, jours, limite, publiques_seulement)


def top_sources(db: Session, jours: int, limite: int = 8, publiques_seulement: bool = True):
    """
    Provenance des visites, domaine par domaine.

    Le referrer est stocké en URL complète : sans regroupement, chaque page
    d'origine formait sa propre entrée et le classement ne disait plus d'où
    venaient les visiteurs.
    """
    depuis = fenetre(jours)
    lignes = _base(db, depuis, publiques_seulement).with_entities(PageView.referrer).all()

    compteurs: Dict[str, int] = {}
    for (referrer,) in lignes:
        compteurs[_domaine(referrer)] = compteurs.get(_domaine(referrer), 0) + 1

    classement = sorted(compteurs.items(), key=lambda couple: couple[1], reverse=True)
    return classement[:limite]


def _domaine(referrer: Optional[str]) -> str:
    if not referrer or not referrer.strip():
        return "Accès direct"
    valeur = referrer.strip()
    for prefixe in ("https://", "http://"):
        if valeur.startswith(prefixe):
            valeur = valeur[len(prefixe):]
            break
    valeur = valeur.split("/")[0].split("?")[0]
    return valeur[:60] or "Accès direct"


def largeurs_ecran(db: Session, jours: int, publiques_seulement: bool = True) -> List[Optional[int]]:
    depuis = fenetre(jours)
    lignes = _base(db, depuis, publiques_seulement).with_entities(PageView.viewport_width).all()
    return [ligne[0] for ligne in lignes]


def totaux(db: Session, jours: int) -> Dict[str, Any]:
    """Chiffres-clés de l'en-tête, publics et coulisses séparés."""
    depuis = fenetre(jours)

    public = _base(db, depuis, True)
    vues_publiques = public.with_entities(func.count(PageView.id)).scalar() or 0
    visiteurs_publics = public.with_entities(
        func.count(distinct(PageView.visitor_hash))
    ).scalar() or 0

    total_brut = db.query(func.count(PageView.id)).filter(
        PageView.timestamp >= depuis
    ).scalar() or 0

    telechargements = db.query(func.count(AnalyticsEvent.id)).filter(
        AnalyticsEvent.timestamp >= depuis,
        AnalyticsEvent.event_name == "download_cv",
    ).scalar() or 0

    return {
        "jours": jours,
        "pages_vues": vues_publiques,
        "visiteurs_uniques": visiteurs_publics,
        "vues_admin": total_brut - vues_publiques,
        "telechargements_cv": telechargements,
        "moyenne_par_jour": round(vues_publiques / jours, 1) if jours else 0.0,
        "pages_par_visiteur": (
            round(vues_publiques / visiteurs_publics, 1) if visiteurs_publics else 0.0
        ),
    }


def evenements(db: Session, jours: int, limite: int = 8) -> List[Tuple[str, int]]:
    """Actions déclenchées par les visiteurs (téléchargement du CV, clics…)."""
    depuis = fenetre(jours)
    lignes = db.query(
        AnalyticsEvent.event_name, func.count(AnalyticsEvent.id).label("total")
    ).filter(AnalyticsEvent.timestamp >= depuis).group_by(
        AnalyticsEvent.event_name
    ).order_by(desc("total")).limit(limite).all()
    return [(ligne[0], ligne[1]) for ligne in lignes]
