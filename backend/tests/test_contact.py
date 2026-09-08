import pytest
from app.routers.contact import rate_limit_map

def test_contact_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "smtpConfigured" in data

def test_contact_submission_success(client):
    rate_limit_map.clear()
    payload = {
        "name": "Jean Dupont",
        "email": "jean.dupont@example.com",
        "phone": "+33 6 12 34 56 78",
        "message": "Bonjour, je souhaite vous contacter pour une opportunité."
    }
    response = client.post("/api/contact", json=payload)
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_contact_botcheck_honeypot(client):
    rate_limit_map.clear()
    payload = {
        "name": "Spam Bot",
        "email": "bot@spam.com",
        "message": "Spam message buy crypto",
        "botcheck": "i_am_a_bot"
    }
    response = client.post("/api/contact", json=payload)
    # Rejet silencieux sans envoyer d email
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_contact_validation_empty_fields(client):
    rate_limit_map.clear()
    payload = {
        "name": "",
        "email": "invalid-email",
        "message": ""
    }
    response = client.post("/api/contact", json=payload)
    assert response.status_code in (400, 422)
