import pytest

def test_security_headers_present(client):
    response = client.get("/")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "Permissions-Policy" in response.headers

def test_tampered_jwt_token_rejected(client):
    fake_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tampered_signature"
    response = client.get("/api/admin/me", headers={"Authorization": f"Bearer {fake_token}"})
    assert response.status_code == 401

def test_sql_injection_payload_sanitization(client, auth_headers):
    # SQL injection attempt in path or query
    malicious_slug = "test-slug' OR '1'='1"
    response = client.get(f"/api/projects/{malicious_slug}?lang=fr")
    assert response.status_code == 404

def test_cors_options_preflight(client):
    response = client.options("/api/projects", headers={
        "Origin": "http://localhost:3006",
        "Access-Control-Request-Method": "GET"
    })
    assert response.status_code in (200, 204)
    assert "access-control-allow-origin" in response.headers
