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

def test_status_icon_and_bar_agree_on_degraded_state():
    """
    check_*_health() (icône + libellé du service) et get_daily_history()
    (barre du jour juste en dessous) doivent trancher pareil pour le même
    service au même instant : l'un utilisait les erreurs cumulées depuis le
    démarrage du processus, l'autre celles du jour -- deux compteurs
    différents pour la même question, donc parfois deux couleurs différentes
    pour le même incident.
    """
    tracker = SystemMetricsTracker()
    tracker.record_request(200)
    tracker.record_request(500)
    tracker.record_request(500)

    summary = tracker.get_status_summary()

    assert summary["status"] == summary["history"]["general"][-1]["status"]
    assert summary["components"]["backend"]["status"] == summary["history"]["backend"][-1]["status"]
    assert summary["components"]["api"]["status"] == summary["history"]["api"][-1]["status"]
    # Concrètement, avec de vraies erreurs serveur aujourd'hui : plus jamais "operational".
    assert summary["status"] != "operational"


def test_today_server_errors_ignores_previous_days(monkeypatch):
    """today_server_errors() ne doit compter que le jour courant, pas le cumul du processus."""
    tracker = SystemMetricsTracker()
    tracker.daily_metrics["2020-01-01"] = {"total": 10, "successful": 5, "client_errors": 0, "server_errors": 5}
    assert tracker.today_server_errors() == 0

    tracker.record_request(500)
    assert tracker.today_server_errors() == 1


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


# ---------------------------------------------------------------------------
# get_system_start_date() : la date affichée pour "depuis quand le système
# tourne" ne doit plus dépendre du démarrage du processus courant, sinon
# chaque redéploiement fait "perdre" l'historique déjà accumulé.
# ---------------------------------------------------------------------------

def test_first_started_at_is_written_once_and_reused(tmp_path, monkeypatch):
    import app.metrics as metrics_module

    marker = tmp_path / "first_started_at.json"
    monkeypatch.setattr(metrics_module, "FIRST_START_FILE", marker)
    monkeypatch.setattr(metrics_tracker, "_find_earliest_known_activity", lambda: None)

    first_call = metrics_tracker._ensure_first_started_at()
    assert marker.exists()

    # Un second appel (= un redémarrage du processus) doit relire le marqueur
    # au lieu de recalculer "aujourd'hui" une nouvelle fois.
    second_call = metrics_tracker._ensure_first_started_at()
    assert second_call == first_call


def test_first_started_at_recovers_the_earliest_known_pageview(tmp_path, monkeypatch, db_session):
    import app.metrics as metrics_module
    from app.models import PageView
    from datetime import datetime, timedelta, timezone
    from sqlalchemy.orm import sessionmaker

    old_date = (datetime.now(timezone.utc) - timedelta(days=3)).date()
    db_session.add(PageView(
        path="/", visitor_hash="v1",
        timestamp=datetime.combine(old_date, datetime.min.time(), tzinfo=timezone.utc),
    ))
    db_session.commit()

    marker = tmp_path / "first_started_at.json"
    monkeypatch.setattr(metrics_module, "FIRST_START_FILE", marker)
    # _find_earliest_known_activity() ouvre sa propre session via le
    # SessionLocal global (hors Depends(get_db), donc hors de la substitution
    # de la fixture `client`) : on la fait pointer vers la même base que
    # `db_session` pour cette vérification précise.
    monkeypatch.setattr(metrics_module, "SessionLocal", sessionmaker(bind=db_session.get_bind()))

    resolved = metrics_tracker._ensure_first_started_at()

    # La date retrouvée doit être celle de la plus ancienne visite connue,
    # pas la date du jour où ce test tourne.
    assert resolved == old_date

