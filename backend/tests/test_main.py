import pytest

def test_root_endpoint_healthy(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["docs"] == "/docs"

def test_http_requests_logging_success(client):
    res = client.get("/api/health")
    assert res.status_code == 200

def test_http_requests_logging_404(client):
    res = client.get("/api/nonexistent-route-404")
    assert res.status_code == 404
