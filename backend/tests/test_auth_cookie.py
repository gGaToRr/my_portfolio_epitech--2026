"""
Auth admin par cookie HttpOnly (remplace le JWT exposé en localStorage).

On vérifie les deux invariants du correctif : le jeton arrive bien dans un
cookie inaccessible au JavaScript (HttpOnly) et non plus dans un corps qu'on
stockerait côté client, et l'ancien transport Bearer reste accepté pour ne
casser aucun appel existant pendant la transition.
"""
from app.config import settings


def test_login_pose_un_cookie_httponly(client):
    r = client.post("/api/admin/login", json={
        "username": "testadmin", "password": "testpassword123",
    })
    assert r.status_code == 200
    cookie = r.headers.get("set-cookie", "").lower()
    assert settings.COOKIE_NAME.lower() in cookie
    assert "httponly" in cookie          # inaccessible au JS -> non volable par XSS
    assert "samesite=strict" in cookie   # protège du CSRF


def test_me_accessible_via_cookie(client):
    # Le TestClient conserve le cookie posé au login et le renvoie tout seul :
    # aucun en-tête Authorization n'est fourni ici.
    client.post("/api/admin/login", json={
        "username": "testadmin", "password": "testpassword123",
    })
    r = client.get("/api/admin/me")
    assert r.status_code == 200
    assert r.json()["authenticated"] is True


def test_me_accepte_encore_le_bearer(client, auth_headers):
    # Repli de compatibilité : un client qui envoie encore un Bearer passe.
    r = client.get("/api/admin/me", headers=auth_headers)
    assert r.status_code == 200


def test_logout_efface_le_cookie_et_coupe_la_session(client):
    client.post("/api/admin/login", json={
        "username": "testadmin", "password": "testpassword123",
    })
    assert client.get("/api/admin/me").status_code == 200

    r = client.post("/api/admin/logout")
    assert r.status_code == 200
    # Après déconnexion, le cookie ne vaut plus rien : /me doit repasser en 401.
    assert client.get("/api/admin/me").status_code == 401


def test_chart_protege_accessible_via_cookie(client):
    client.post("/api/admin/login", json={
        "username": "testadmin", "password": "testpassword123",
    })
    r = client.get("/api/admin/analytics/chart/fuseaux?days=30&theme=dark")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("image/svg+xml")


def test_acces_admin_refuse_sans_jeton(client):
    assert client.get("/api/admin/me").status_code == 401
    assert client.get("/api/admin/analytics/overview").status_code == 401
