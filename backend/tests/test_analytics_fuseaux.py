"""Le fuseau horaire est collecté mais n'était affiché nulle part : on vérifie
que la figure 'fuseaux' existe, se rend, et que l'aperçu porte bien ces valeurs."""
from app.routers.analytics import GRAPHIQUES


def _login(client):
    client.post("/api/admin/login", json={
        "username": "testadmin", "password": "testpassword123",
    })


def test_fuseaux_est_un_graphique_connu():
    assert "fuseaux" in GRAPHIQUES


def test_overview_expose_les_fuseaux(client):
    _login(client)
    data = client.get("/api/admin/analytics/overview?days=30").json()
    assert "fuseaux" in data
    assert "fuseaux" in data["graphiques"]


def test_chart_fuseaux_se_rend(client):
    _login(client)
    r = client.get("/api/admin/analytics/chart/fuseaux?days=7&theme=light")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("image/svg+xml")
    assert len(r.content) > 500
