import pytest
from app.metrics import metrics_tracker, SystemMetricsTracker

def test_public_status_stays_minimal(client):
    """La sonde publique ne doit exposer que l'état global."""
    res = client.get("/status")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "uptime_seconds" in data
    assert "uptime_human" in data
    assert "started_at" in data
    # Ces champs contenaient des données internes (conteneurs Docker, version
    # de Python) et les IP d'autres visiteurs via recent_bugs.
    for leaked in ("components", "recent_bugs", "metrics", "history"):
        assert leaked not in data, f"'{leaked}' ne doit plus être public"

def test_public_status_alias_api_status(client):
    res = client.get("/api/status")
    assert res.status_code == 200
    assert "components" not in res.json()

def test_admin_status_requires_auth(client):
    assert client.get("/api/admin/status").status_code == 401

def test_admin_status_returns_full_detail(client, auth_headers):
    res = client.get("/api/admin/status", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["components"]["database"]["status"] == "connected"
    assert data["components"]["database"]["type"] == "SQLite"
    assert "recent_bugs" in data
    assert "metrics" in data

def test_metrics_tracker_uptime_calculation():
    tracker = SystemMetricsTracker()
    assert tracker.get_uptime_seconds() >= 0
    human = tracker.get_uptime_human()
    assert "seconde" in human

def test_metrics_tracker_request_recording():
    tracker = SystemMetricsTracker()
    tracker.record_request(200)
    tracker.record_request(201)
    tracker.record_request(404)
    tracker.record_request(500)
    
    assert tracker.total_requests == 4
    assert tracker.successful_requests == 2
    assert tracker.client_errors == 1
    assert tracker.server_errors == 1

def test_metrics_tracker_bug_recording():
    tracker = SystemMetricsTracker()
    tracker.record_bug("NullPointerException", "Cannot read properties", "/projects/test", "127.0.0.1")
    assert len(tracker.recent_errors) == 1
    bug = tracker.recent_errors[0]
    assert bug["error_type"] == "NullPointerException"
    assert bug["message"] == "Cannot read properties"
    assert bug["path"] == "/projects/test"
    
    tracker.clear_bugs()
    assert len(tracker.recent_errors) == 0

def test_report_client_bug_endpoint(client):
    payload = {
        "error_type": "TypeError",
        "message": "Uncaught TypeError: x is not a function",
        "path": "/panelAdmin",
        "stack": "TypeError: x is not a function\n at handleClick"
    }
    res = client.post("/api/bugs/report", json=payload)
    assert res.status_code == 201
    assert res.json()["success"] is True

def test_clear_bugs_endpoint_with_auth(client, auth_headers):
    # Enregistrer un bug d abord
    client.post("/api/bugs/report", json={"message": "Bug test", "error_type": "TestError"})
    
    # Non auth -> 401
    res_unauth = client.post("/api/admin/bugs/clear")
    assert res_unauth.status_code == 401
    
    # Auth -> 200
    res_auth = client.post("/api/admin/bugs/clear", headers=auth_headers)
    assert res_auth.status_code == 200
    assert res_auth.json()["success"] is True

def test_db_health_probe():
    health = metrics_tracker.check_db_health()
    assert health["status"] == "connected"
    assert "latency_ms" in health
    assert health["type"] == "SQLite"

def test_smtp_health_probe():
    health = metrics_tracker.check_smtp_health()
    assert "status" in health
    assert "is_active" in health
    assert "label" in health

def test_get_recent_days_logs_endpoint(client, auth_headers):
    # Non auth -> 401
    res_unauth = client.get("/api/admin/logs/recent-days")
    assert res_unauth.status_code == 401

    # Auth -> 200
    res_auth = client.get("/api/admin/logs/recent-days?days=5&lines_per_day=50", headers=auth_headers)
    assert res_auth.status_code == 200
    data = res_auth.json()
    assert data["days_count"] == 5
    assert len(data["days"]) == 5
    assert "day_index" in data["days"][0]
    assert "filename" in data["days"][0]
    assert "label" in data["days"][0]

