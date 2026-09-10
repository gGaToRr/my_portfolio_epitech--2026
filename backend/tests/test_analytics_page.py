"""
Tests de l'écran Analytics : agrégations, rendu des graphiques et endpoints.
"""
from datetime import datetime, timedelta, timezone

import pytest

from app import analytics_queries as aq
from app import charts
from app.models import PageView, AnalyticsEvent


def _vue(db, path="/", jours_avant=0, heure=12, visiteur="v1", **extra):
    horodatage = datetime.now(timezone.utc) - timedelta(days=jours_avant)
    horodatage = horodatage.replace(hour=heure, minute=0, second=0, microsecond=0)
    vue = PageView(
        path=path,
        visitor_hash=visiteur,
        timestamp=horodatage,
        device_type=extra.get("device", "desktop"),
        browser=extra.get("browser", "Chrome"),
        os=extra.get("os", "Linux"),
        referrer=extra.get("referrer"),
        viewport_width=extra.get("viewport_width"),
        timezone=extra.get("tz"),
    )
    db.add(vue)
    db.commit()
    return vue


# ---------------------------------------------------------------------------
# Agrégations
# ---------------------------------------------------------------------------

def test_serie_quotidienne_garde_les_jours_vides(db_session):
    """
    Un jour sans visite doit rester dans la série, à zéro.

    L'omettre resserrerait la courbe et transformerait une interruption de
    fréquentation en simple absence de point.
    """
    _vue(db_session, jours_avant=0)
    _vue(db_session, jours_avant=3)

    libelles, vues, visiteurs = aq.serie_quotidienne(db_session, 5)
    assert len(libelles) == 5 and len(vues) == 5 and len(visiteurs) == 5
    assert vues[-1] == 1          # aujourd'hui
    assert vues[-4] == 1          # il y a trois jours
    assert vues[-2] == 0 and vues[-3] == 0


def test_pages_admin_exclues_du_trafic_public(db_session):
    """
    Les pages du panneau ne sont visitées que par le propriétaire : les compter
    comme du trafic gonflait le nombre de visiteurs avec sa propre activité.
    """
    for _ in range(5):
        _vue(db_session, path="/panelAdmin", visiteur="proprio")
    _vue(db_session, path="/", visiteur="visiteur")

    totaux = aq.totaux(db_session, 7)
    assert totaux["pages_vues"] == 1
    assert totaux["visiteurs_uniques"] == 1
    assert totaux["vues_admin"] == 5

    assert [p[0] for p in aq.top_pages(db_session, 7)] == ["/"]


def test_matrice_horaire_est_indexee_jour_puis_heure(db_session):
    _vue(db_session, jours_avant=0, heure=9)
    _vue(db_session, jours_avant=0, heure=9)
    matrice = aq.matrice_horaire(db_session, 7)

    assert len(matrice) == 7 and all(len(ligne) == 24 for ligne in matrice)
    jour = (datetime.now(timezone.utc)).weekday()
    assert matrice[jour][9] == 2
    assert sum(sum(ligne) for ligne in matrice) == 2


@pytest.mark.parametrize("referrer,attendu", [
    ("https://www.linkedin.com/feed/", "www.linkedin.com"),
    ("http://localhost:3006/panelAdmin", "localhost:3006"),
    ("https://github.com/gGaToRr?tab=repositories", "github.com"),
    ("", "Accès direct"),
    (None, "Accès direct"),
    ("   ", "Accès direct"),
])
def test_sources_regroupees_par_domaine(db_session, referrer, attendu):
    """
    Le referrer est stocké en URL complète : sans regroupement, chaque page
    d'origine formait sa propre entrée et le classement ne disait plus rien.
    """
    _vue(db_session, referrer=referrer)
    sources = aq.top_sources(db_session, 7)
    assert sources[0][0] == attendu


def test_totaux_sans_aucune_visite(db_session):
    """Aucune division par zéro quand la période est vide."""
    totaux = aq.totaux(db_session, 30)
    assert totaux["pages_vues"] == 0
    assert totaux["pages_par_visiteur"] == 0.0
    assert totaux["moyenne_par_jour"] == 0.0


def test_repartition_largeurs_ecran():
    largeurs = [320, 500, 800, 1280, 1600, 2560, None, 0]
    repartition = dict(charts.repartir_largeurs(largeurs))
    assert repartition["< 480 px · mobile"] == 1
    assert repartition["480 – 768 px · grand mobile"] == 1
    assert repartition["768 – 1024 px · tablette"] == 1
    assert repartition["1024 – 1440 px · portable"] == 1
    assert repartition["1440 – 1920 px · bureau"] == 1
    assert repartition["> 1920 px · grand écran"] == 1
    # None et 0 ne sont rangés nulle part plutôt que comptés comme "mobile".
    assert sum(repartition.values()) == 6


# ---------------------------------------------------------------------------
# Rendu des figures
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("theme", ["light", "dark"])
def test_chaque_figure_produit_un_svg_valide(theme):
    figures = [
        charts.chart_trafic_quotidien(["01/01", "02/01"], [3, 5], [2, 4], theme),
        charts.chart_heures_affluence([[1] * 24 for _ in range(7)], theme),
        charts.chart_barres_horizontales(["/", "/projets"], [9, 4], theme),
        charts.chart_technologies([("Chrome", 8)], [("Linux", 8)], theme),
        charts.chart_largeurs_ecran(charts.repartir_largeurs([1280, 1600]), theme),
    ]
    for svg in figures:
        assert svg.lstrip().startswith("<?xml")
        assert "<svg" in svg and "</svg>" in svg


@pytest.mark.parametrize("theme", ["light", "dark"])
def test_les_figures_vides_expliquent_au_lieu_de_paraitre_cassees(theme):
    """
    Des axes vides ressemblent à une panne ; une absence de visite est une
    information et doit être écrite.
    """
    svg = charts.chart_trafic_quotidien([], [], [], theme)
    assert "Aucune visite" in svg
    assert charts.chart_heures_affluence([[0] * 24 for _ in range(7)], theme)
    assert "Aucune" in charts.chart_barres_horizontales([], [], theme)


def test_le_theme_change_reellement_les_couleurs():
    clair = charts.chart_trafic_quotidien(["01/01"], [1], [1], "light")
    sombre = charts.chart_trafic_quotidien(["01/01"], [1], [1], "dark")
    assert charts.PALETTES["light"].surface.lower() in clair.lower()
    assert charts.PALETTES["dark"].surface.lower() in sombre.lower()
    assert clair != sombre


def test_theme_inconnu_retombe_sur_le_clair():
    assert charts.get_palette("mauve") is charts.PALETTES["light"]
    assert charts.get_palette(None) is charts.PALETTES["light"]


def test_le_rendu_ne_laisse_pas_de_figures_ouvertes():
    """
    Chaque figure doit être fermée après enregistrement : sur un endpoint
    interrogé en boucle, les figures oubliées s'accumulent en mémoire.
    """
    import matplotlib.pyplot as plt

    plt.close("all")
    for _ in range(12):
        charts.chart_trafic_quotidien(["01/01", "02/01"], [1, 2], [1, 1], "light")
    assert plt.get_fignums() == []


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

def test_overview_exige_une_authentification(client):
    assert client.get("/api/admin/analytics/overview").status_code == 401


def test_overview_renvoie_chiffres_et_tableaux(client, auth_headers, db_session):
    _vue(db_session, path="/", referrer="https://linkedin.com/in/x")
    res = client.get("/api/admin/analytics/overview?days=7", headers=auth_headers)
    assert res.status_code == 200

    donnees = res.json()
    for cle in ("totaux", "trafic", "pages", "sources", "navigateurs",
                "systemes", "ecrans", "evenements", "graphiques"):
        assert cle in donnees, f"champ manquant : {cle}"
    assert len(donnees["trafic"]) == 7
    assert donnees["totaux"]["pages_vues"] == 1


@pytest.mark.parametrize("nom", ["trafic", "heures", "pages", "sources", "technologies", "ecrans"])
@pytest.mark.parametrize("theme", ["light", "dark"])
def test_chaque_graphique_est_servi_en_svg(client, auth_headers, nom, theme):
    res = client.get(
        f"/api/admin/analytics/chart/{nom}?days=7&theme={theme}", headers=auth_headers
    )
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("image/svg+xml")
    # Jamais de cache : les chiffres changent en continu.
    assert res.headers["cache-control"] == "no-store"
    assert b"<svg" in res.content


def test_graphique_exige_une_authentification(client):
    assert client.get("/api/admin/analytics/chart/trafic").status_code == 401


def test_nom_de_graphique_inconnu_rejete(client, auth_headers):
    """Le nom sert d'aiguillage sur une liste fermée, jamais de chemin."""
    for nom in ("inexistant", "../secret", "trafic;rm"):
        res = client.get(f"/api/admin/analytics/chart/{nom}", headers=auth_headers)
        assert res.status_code in (404, 422), nom


@pytest.mark.parametrize("theme", ["mauve", "", "LIGHT; drop"])
def test_theme_invalide_rejete(client, auth_headers, theme):
    res = client.get(
        "/api/admin/analytics/chart/trafic", params={"theme": theme}, headers=auth_headers
    )
    assert res.status_code == 422


@pytest.mark.parametrize("days,attendu", [(0, 422), (-1, 422), (400, 422), (1, 200), (365, 200)])
def test_periode_bornee(client, auth_headers, days, attendu):
    res = client.get(f"/api/admin/analytics/overview?days={days}", headers=auth_headers)
    assert res.status_code == attendu


# ---------------------------------------------------------------------------
# Collecte des nouveaux signaux
# ---------------------------------------------------------------------------

def test_viewport_et_fuseau_sont_enregistres(client, db_session):
    res = client.post("/api/analytics/collect", json={
        "path": "/",
        "viewport_width": 1512,
        "timezone": "Europe/Paris",
    }, headers={"User-Agent": "Mozilla/5.0 Chrome/120"})
    assert res.status_code == 204

    vue = db_session.query(PageView).order_by(PageView.id.desc()).first()
    assert vue.viewport_width == 1512
    assert vue.timezone == "Europe/Paris"


@pytest.mark.parametrize("largeur", [-5, 99999, "abc"])
def test_viewport_aberrant_rejete(client, largeur):
    res = client.post("/api/analytics/collect",
                      json={"path": "/", "viewport_width": largeur})
    assert res.status_code == 422


def test_fuseau_horaire_est_neutralise(client, db_session):
    """Le fuseau vient du client : pas de saut de ligne dans les logs ni en base."""
    client.post("/api/analytics/collect",
                json={"path": "/", "timezone": "Europe/Paris\nFAUX"})
    vue = db_session.query(PageView).order_by(PageView.id.desc()).first()
    assert "\n" not in (vue.timezone or "")
