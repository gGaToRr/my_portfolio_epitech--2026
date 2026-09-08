import pytest

def test_list_projects_public(client):
    response = client.get("/api/projects?lang=fr")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_project_requires_auth(client):
    new_project = {
        "title": "Nouveau Projet",
        "slug": "nouveau-projet",
        "tagline": "Description courte",
        "lang": "fr",
        "stack": ["React", "FastAPI"],
        "sections": [{"heading": "Aperçu", "body": "Détails"}]
    }
    # Sans token -> 401
    res = client.post("/api/admin/projects", json=new_project)
    assert res.status_code == 401

def test_create_and_get_project_with_auth(client, auth_headers):
    new_project = {
        "title": "API Backend Engine",
        "slug": "api-backend-engine",
        "tagline": "FastAPI High Performance Server",
        "lang": "fr",
        "stack": ["Python", "FastAPI", "SQLite"],
        "sections": [{"heading": "Architecture", "body": "Architecture modulaire et asynchrone."}],
        "featured": True,
        "display_order": 1
    }
    
    # Création Admin
    post_res = client.post("/api/admin/projects", json=new_project, headers=auth_headers)
    assert post_res.status_code == 201
    created = post_res.json()
    project_id = created["id"]
    assert created["slug"] == "api-backend-engine"

    # Lecture publique
    get_res = client.get("/api/projects/api-backend-engine?lang=fr")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "API Backend Engine"

    # Modification Admin
    update_res = client.put(f"/api/admin/projects/{project_id}", json={
        "tagline": "FastAPI High Performance Server (Updated)"
    }, headers=auth_headers)
    assert update_res.status_code == 200
    assert update_res.json()["tagline"] == "FastAPI High Performance Server (Updated)"

    # Suppression Admin
    del_res = client.delete(f"/api/admin/projects/{project_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # Vérification 404 après suppression
    not_found_res = client.get("/api/projects/api-backend-engine?lang=fr")
    assert not_found_res.status_code == 404

def test_list_epitech_projects(client):
    response = client.get("/api/epitech-projects?lang=fr")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
