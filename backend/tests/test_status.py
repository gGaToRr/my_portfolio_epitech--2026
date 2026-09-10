import pytest
from app.metrics import metrics_tracker, SystemMetricsTracker

def test_get_system_status_endpoint(client):
    res = client.get("/status")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "uptime_seconds" in data
    assert "uptime_human" in data
    assert "started_at" in data
    assert "metrics" in data
    assert "components" in data
    assert "recent_bugs" in data
    assert data["components"]["database"]["status"] == "connected"

def test_get_system_status_alias_api_status(client):
    res = client.get("/api/status")
    assert res.status_code == 200
    data = res.json()
    assert data["components"]["database"]["type"] == "SQLite"

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
