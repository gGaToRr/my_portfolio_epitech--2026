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
