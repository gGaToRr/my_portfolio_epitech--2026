import pytest

def test_admin_login_success(client):
    response = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "testpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == "testadmin"

def test_admin_login_wrong_password(client):
    response = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Identifiants incorrects" in response.json()["detail"]

def test_admin_login_unknown_user(client):
    response = client.post("/api/admin/login", json={
        "username": "nonexistent_user",
        "password": "somepassword"
    })
    assert response.status_code == 401

def test_admin_login_rate_limiting(client):
    # 5 failed attempts
    for _ in range(5):
        res = client.post("/api/admin/login", json={
            "username": "testadmin",
            "password": "bad_password"
        })
        assert res.status_code == 401
    
    # 6th attempt should be blocked with 429 Too Many Requests
    blocked_res = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "testpassword123"
    })
    assert blocked_res.status_code == 429
    assert "Trop de tentatives" in blocked_res.json()["detail"]

def test_get_me_authenticated(client, auth_headers):
    response = client.get("/api/admin/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["authenticated"] is True
    assert data["username"] == "testadmin"

def test_get_me_unauthorized(client):
    response = client.get("/api/admin/me")
    assert response.status_code == 401

def test_token_lifespan_is_30_minutes(client):
    from jose import jwt
    from datetime import datetime, timezone
    from app.config import settings
    
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 30
    
    response = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "testpassword123"
    })
    token = response.json()["access_token"]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    
    exp_timestamp = payload["exp"]
    now_timestamp = datetime.now(timezone.utc).timestamp()
    
    # Expiration is ~30 minutes (between 29 and 31 minutes)
    diff_minutes = (exp_timestamp - now_timestamp) / 60
    assert 29.0 <= diff_minutes <= 31.0

def test_expired_token_rejected(client):
    from datetime import timedelta
    from app.auth import create_access_token
    expired_token = create_access_token(data={"sub": "testadmin"}, expires_delta=timedelta(minutes=-5))
    res = client.get("/api/admin/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401


# ---------------------------------------------------------------------------
# Changement de mot de passe
# ---------------------------------------------------------------------------

def test_change_password_requires_auth(client):
    res = client.post("/api/admin/password", json={
        "current_password": "testpassword123", "new_password": "newpassword456",
    })
    assert res.status_code == 401


def test_change_password_wrong_current_password_rejected(client, auth_headers):
    res = client.post("/api/admin/password", headers=auth_headers, json={
        "current_password": "not_the_real_password", "new_password": "newpassword456",
    })
    assert res.status_code == 401
    assert "actuel incorrect" in res.json()["detail"]

    # Le mot de passe d'origine reste valide : rien n'a été modifié.
    still_works = client.post("/api/admin/login", json={
        "username": "testadmin", "password": "testpassword123",
    })
    assert still_works.status_code == 200


def test_change_password_too_short_rejected(client, auth_headers):
    res = client.post("/api/admin/password", headers=auth_headers, json={
        "current_password": "testpassword123", "new_password": "short",
    })
    assert res.status_code == 422


def test_change_password_same_as_current_rejected(client, auth_headers):
    res = client.post("/api/admin/password", headers=auth_headers, json={
        "current_password": "testpassword123", "new_password": "testpassword123",
    })
    assert res.status_code == 400


def test_change_password_success_replaces_the_old_one(client, auth_headers):
    res = client.post("/api/admin/password", headers=auth_headers, json={
        "current_password": "testpassword123", "new_password": "newpassword456",
    })
    assert res.status_code == 200
    assert res.json()["success"] is True

    old_password_fails = client.post("/api/admin/login", json={
        "username": "testadmin", "password": "testpassword123",
    })
    assert old_password_fails.status_code == 401

    new_password_works = client.post("/api/admin/login", json={
        "username": "testadmin", "password": "newpassword456",
    })
    assert new_password_works.status_code == 200


def test_change_password_rate_limited_on_repeated_wrong_current_password(client, auth_headers):
    for _ in range(5):
        res = client.post("/api/admin/password", headers=auth_headers, json={
            "current_password": "wrong_password", "new_password": "newpassword456",
        })
        assert res.status_code == 401

    blocked = client.post("/api/admin/password", headers=auth_headers, json={
        "current_password": "testpassword123", "new_password": "newpassword456",
    })
    assert blocked.status_code == 429


def test_change_password_rejects_non_ascii_new_password(client, auth_headers):
    res = client.post("/api/admin/password", headers=auth_headers, json={
        "current_password": "testpassword123", "new_password": "café_du_matin_9",
    })
    assert res.status_code == 422


# ---------------------------------------------------------------------------
# secrets.compare_digest() refuse toute chaîne non-ASCII (TypeError) : un mot
# de passe accentué faisait planter login_admin en 500 au lieu d'un simple 401,
# parce que la comparaison d'amorçage s'exécutait avant même de vérifier si le
# compte existait déjà.
# ---------------------------------------------------------------------------

def test_safe_compare_returns_false_instead_of_raising_on_non_ascii():
    from app.routers.auth import _safe_compare
    assert _safe_compare("café", "testpassword123") is False
    assert _safe_compare("testpassword123", "café") is False
    assert _safe_compare("testpassword123", "testpassword123") is True
    assert _safe_compare("testpassword123", "wrong") is False


def test_login_with_non_ascii_password_fails_cleanly_for_an_existing_account(client):
    # Le compte "testadmin" existe déjà (fixture db_session) : c'est
    # exactement le cas qui plantait, puisque le court-circuit sur `not user`
    # est justement ce qui manquait.
    res = client.post("/api/admin/login", json={
        "username": "testadmin", "password": "café_du_matin_9",
    })
    assert res.status_code == 401


def test_bootstrap_login_with_non_ascii_password_fails_cleanly(client, db_session, monkeypatch):
    from app.config import settings
    from app.models import AdminUser

    # Aucun compte pour cet utilisateur : on retombe sur la comparaison
    # d'amorçage face à settings.ADMIN_PASSWORD.
    db_session.query(AdminUser).filter(AdminUser.username == "testadmin").delete()
    db_session.commit()
    monkeypatch.setattr(settings, "ADMIN_USERNAME", "testadmin")
    monkeypatch.setattr(settings, "ADMIN_PASSWORD", "testpassword123")

    res = client.post("/api/admin/login", json={
        "username": "testadmin", "password": "café_du_matin_9",
    })
    assert res.status_code == 401


# ---------------------------------------------------------------------------
# Intégrité cryptographique HMAC anti-tampering
# ---------------------------------------------------------------------------

def test_tampered_password_in_db_without_valid_hmac_fails_login(client, db_session):
    from app.models import AdminUser
    from app.auth import hash_password

    # Un attaquant ayant un accès direct à SQLite tente d'injecter son propre hash
    attacker_hash = hash_password("attacker_password")
    admin = db_session.query(AdminUser).filter(AdminUser.username == "testadmin").first()
    admin.hashed_password = attacker_hash
    # Il ne connait pas SECRET_KEY donc la signature est invalide ou manquante
    db_session.commit()

    # Tentative de connexion avec le mot de passe injecté
    res = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "attacker_password"
    })
    assert res.status_code == 401
    assert "Identifiants incorrects" in res.json()["detail"]


def test_tampered_database_rejects_active_admin_session(client, db_session, auth_headers):
    from app.models import AdminUser
    from app.auth import hash_password

    # Session valide au départ
    res = client.get("/api/admin/me", headers=auth_headers)
    assert res.status_code == 200

    # Altération directe en base de données
    admin = db_session.query(AdminUser).filter(AdminUser.username == "testadmin").first()
    admin.hashed_password = hash_password("hijacked_password")
    db_session.commit()

    # La session doit être rejetée car l'intégrité de l'utilisateur est rompue
    res_tampered = client.get("/api/admin/me", headers=auth_headers)
    assert res_tampered.status_code == 401


def test_legacy_account_without_signature_auto_upgrades_on_valid_login(client, db_session):
    from app.models import AdminUser
    from app.auth import compute_credential_signature

    admin = db_session.query(AdminUser).filter(AdminUser.username == "testadmin").first()
    admin.integrity_signature = None
    db_session.commit()

    res = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "testpassword123"
    })
    assert res.status_code == 200

    # La signature a été automatiquement calculée et persistée
    db_session.refresh(admin)
    assert admin.integrity_signature is not None
    assert admin.integrity_signature == compute_credential_signature("testadmin", admin.hashed_password)


