import pytest

def test_contact_health_is_minimal(client):
    """La sonde publique ne doit plus divulguer l'adresse de destination."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "receiver" not in data
    assert "smtpConfigured" not in data

def test_admin_health_exposes_config(client, auth_headers):
    """Le détail SMTP reste disponible, mais authentifié."""
    assert client.get("/api/admin/health").status_code == 401
    res = client.get("/api/admin/health", headers=auth_headers)
    assert res.status_code == 200
    assert "smtpConfigured" in res.json()
    assert "receiver" in res.json()

def test_contact_submission_success(client):
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

def test_contact_rejects_empty_name(client):
    """Un seul champ invalide par test : sinon on ne sait pas lequel a déclenché le rejet."""
    response = client.post("/api/contact", json={
        "name": "   ",
        "email": "valide@example.com",
        "message": "Bonjour"
    })
    assert response.status_code == 422

def test_contact_rejects_empty_message(client):
    response = client.post("/api/contact", json={
        "name": "Jean",
        "email": "valide@example.com",
        "message": "   "
    })
    assert response.status_code == 422

def test_contact_rejects_malformed_email(client):
    """Le frontend valide déjà, mais l'API est appelable directement."""
    for bad in ["pas-du-tout-un-email", "sans@domaine", "a b@c.fr", "a@b.c\nBcc: cible@evil.tld"]:
        res = client.post("/api/contact", json={
            "name": "Jean",
            "email": bad,
            "message": "Bonjour"
        })
        assert res.status_code == 422, f"email accepte a tort : {bad!r}"
