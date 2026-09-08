import pytest

def test_collect_pageview(client):
    payload = {
        "path": "/projects/my-portfolio",
        "referrer": "https://google.com",
        "language": "fr-FR"
    }
    response = client.post("/api/analytics/collect", json=payload, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0"
    })
    assert response.status_code == 204

def test_collect_event(client):
    payload = {
        "event_name": "download_cv",
        "target": "CV_PIERRE_UNTERSINGER.pdf",
        "path": "/",
        "extra_data": {"format": "pdf"}
    }
    response = client.post("/api/analytics/event", json=payload, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15"
    })
    assert response.status_code == 204

def test_admin_analytics_stats_requires_auth(client):
    res = client.get("/api/admin/analytics/stats")
    assert res.status_code == 401

def test_admin_analytics_stats_authenticated(client, auth_headers):
    # Collect a pageview first
    client.post("/api/analytics/collect", json={"path": "/"}, headers={"User-Agent": "Chrome"})
    
    response = client.get("/api/admin/analytics/stats?days=7", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_pageviews" in data
    assert "unique_visitors" in data
    assert "top_pages" in data
    assert "device_breakdown" in data
    assert "views_per_day" in data
