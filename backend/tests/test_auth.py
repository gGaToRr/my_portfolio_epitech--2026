import pytest
from app.routers.auth import login_attempts

def test_admin_login_success(client):
    login_attempts.clear()
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
    login_attempts.clear()
    response = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Identifiants incorrects" in response.json()["detail"]

def test_admin_login_unknown_user(client):
    login_attempts.clear()
    response = client.post("/api/admin/login", json={
        "username": "nonexistent_user",
        "password": "somepassword"
    })
    assert response.status_code == 401

def test_admin_login_rate_limiting(client):
    login_attempts.clear()
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
    login_attempts.clear()
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

