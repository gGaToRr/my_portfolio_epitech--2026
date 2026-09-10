"""
Tests de non-régression pour les failles identifiées lors de l'audit.

Chaque test reproduit l'attaque telle qu'elle fonctionnait, et vérifie qu'elle
ne fonctionne plus. Le commentaire de chaque test décrit le comportement
d'origine, pour qu'une régression soit immédiatement identifiable.
"""
import pytest

from app.security import get_client_ip, resolve_inside, sanitize_log_value


# ---------------------------------------------------------------------------
# S2 — Lecture de fichier arbitraire via ?filename=
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("payload", [
    "/etc/passwd",
    "/etc/hostname",
    "../data/portfolio.db",
    "../../../../etc/passwd",
    "../app/config.py",
    "..",
    "../",
])
def test_live_logs_rejects_path_traversal(client, auth_headers, payload):
    """
    Avant correctif : `logs_dir / filename` renvoyait le contenu de n'importe
    quel fichier lisible ('/etc/passwd' répondait 200 avec ses lignes).
    """
    res = client.get("/api/admin/logs/live", params={"filename": payload, "lines": 10}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    # Le nom renvoyé doit être un fichier de log, jamais la cible demandée.
    assert data["filename"] not in ("passwd", "hostname", "portfolio.db", "config.py")
    assert data["filename"].endswith(".log")
    for line in data["lines"]:
        assert "root:x:" not in line


def test_resolve_inside_confines_to_base(tmp_path):
    """Test unitaire du garde-fou, indépendamment de la route."""
    base = tmp_path / "logs"
    base.mkdir()
    (base / "ok.log").write_text("contenu")
    (tmp_path / "secret.txt").write_text("secret")

    assert resolve_inside(base, "ok.log") == (base / "ok.log").resolve()

    # Un chemin absolu ou remontant est ramené sous `base` : le fichier visé
    # devient un nom inexistant dans le dossier des logs, jamais la vraie cible.
    for hostile in ("/etc/passwd", "../secret.txt", "../../etc/passwd"):
        resolved = resolve_inside(base, hostile)
        assert resolved is not None
        assert resolved.parent == base.resolve(), hostile
        assert not resolved.exists(), hostile

    assert resolve_inside(base, "..") is None
    assert resolve_inside(base, ".") is None
    assert resolve_inside(base, None) is None
    assert resolve_inside(base, "") is None


def test_live_logs_still_serves_a_valid_filename(client, auth_headers):
    """Le correctif ne doit pas casser l'usage normal."""
    res = client.get("/api/admin/logs/live", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["filename"].endswith(".log")


# ---------------------------------------------------------------------------
# S3 — Contournement du rate-limit par X-Forwarded-For
# ---------------------------------------------------------------------------

def test_login_rate_limit_not_bypassed_by_forwarded_header(client):
    """
    Avant correctif : le compteur était indexé sur X-Forwarded-For, un en-tête
    envoyé par le client. 12 tentatives avec une IP différente à chaque fois ne
    déclenchaient jamais de 429.
    """
    codes = []
    for i in range(12):
        res = client.post(
            "/api/admin/login",
            json={"username": "testadmin", "password": "mauvais"},
            headers={"X-Forwarded-For": f"10.0.0.{i}"},
        )
        codes.append(res.status_code)

    assert 429 in codes, f"brute-force toujours illimité : {codes}"
    assert codes[:5] == [401] * 5, "les 5 premières tentatives doivent être des échecs normaux"


class _FakeRequest:
    """Requête minimale pour tester get_client_ip sans passer par le réseau."""
    def __init__(self, xff=None, real_ip=None, peer="10.0.0.1"):
        self.headers = {}
        if xff is not None:
            self.headers["x-forwarded-for"] = xff
        if real_ip is not None:
            self.headers["x-real-ip"] = real_ip
        self.client = type("Peer", (), {"host": peer})()


def test_get_client_ip_ignores_forwarded_header_without_proxy():
    """TRUSTED_PROXY_HOPS vaut 0 par défaut : l'en-tête ne doit pas être lu."""
    req = _FakeRequest(xff="1.2.3.4", real_ip="5.6.7.8", peer="10.0.0.1")
    assert get_client_ip(req) == "10.0.0.1"


def test_get_client_ip_reads_nth_entry_from_the_right(monkeypatch):
    """
    Avec deux proxys de confiance (nginx puis le relais server.js), seule
    l'avant-dernière entrée est fiable. Les valeurs de gauche sont celles que
    le visiteur a pu écrire lui-même avant d'atteindre nginx.
    """
    from app.config import settings
    monkeypatch.setattr(settings, "TRUSTED_PROXY_HOPS", 2)

    req = _FakeRequest(xff="1.2.3.4, 90.90.90.90, 172.18.0.3")
    assert get_client_ip(req) == "90.90.90.90"

    # Un client qui n'envoie rien : nginx puis server.js ajoutent chacun une entrée.
    req = _FakeRequest(xff="90.90.90.90, 172.18.0.3")
    assert get_client_ip(req) == "90.90.90.90"

    # Chaîne plus courte qu'annoncé : on refuse de deviner et on retombe
    # sur une valeur sûre plutôt que de retenir une entrée forgée.
    req = _FakeRequest(xff="1.2.3.4", peer="172.18.0.3")
    assert get_client_ip(req) == "172.18.0.3"


def test_forged_forwarded_entries_cannot_split_the_rate_limit(monkeypatch):
    """Un client qui invente des entrées reste compté sur la même clé."""
    from app.config import settings
    monkeypatch.setattr(settings, "TRUSTED_PROXY_HOPS", 2)

    vus = {
        get_client_ip(_FakeRequest(xff=f"forge-{i}, 90.90.90.90, 172.18.0.3"))
        for i in range(20)
    }
    assert vus == {"90.90.90.90"}


def test_login_rate_limit_releases_after_success(client):
    """Un identifiant correct doit remettre le compteur à zéro."""
    for _ in range(3):
        client.post("/api/admin/login", json={"username": "testadmin", "password": "mauvais"})
    ok = client.post("/api/admin/login", json={"username": "testadmin", "password": "testpassword123"})
    assert ok.status_code == 200
    again = client.post("/api/admin/login", json={"username": "testadmin", "password": "testpassword123"})
    assert again.status_code == 200


# ---------------------------------------------------------------------------
# S4 — Fuite d'informations par la sonde publique
# ---------------------------------------------------------------------------

def test_public_status_never_leaks_visitor_ips(client):
    """
    Avant correctif : /api/status renvoyait `recent_bugs`, dont le champ
    client_ip contient les adresses IP d'autres visiteurs.
    """
    client.post("/api/bugs/report", json={"error_type": "TypeError", "message": "trace interne", "path": "/x"})
    body = client.get("/api/status").text
    assert "client_ip" not in body
    assert "trace interne" not in body
    assert "python_version" not in body


# ---------------------------------------------------------------------------
# S6 — Injection de fausses lignes dans les logs
# ---------------------------------------------------------------------------

def test_sanitize_log_value_strips_newlines_and_ansi():
    """
    Avant correctif : `event_name` était interpolé brut. Un saut de ligne suivi
    d'un code ANSI suffisait à forger une ligne complète dans la console admin.
    """
    forged = "clic\n\x1b[92m[2026-01-01 00:00:00][auth.py](login_admin)-----Connexion reussie"
    cleaned = sanitize_log_value(forged)
    assert "\n" not in cleaned
    assert "\x1b" not in cleaned
    assert "\r" not in cleaned


def test_event_source_is_not_client_controlled(client):
    """
    Avant correctif : extra_data.source_file / source_func devenaient le fichier
    et la fonction inscrits dans le log, donc choisis par l'appelant.
    """
    res = client.post("/api/analytics/event", json={
        "event_name": "clic",
        "target": "bouton",
        "extra_data": {"source_file": "auth.py", "source_func": "login_admin"},
    })
    assert res.status_code == 204


def test_bug_report_message_is_sanitized(client, auth_headers):
    """Le message d'un rapport de bug public ne doit pas contenir de saut de ligne."""
    client.post("/api/bugs/report", json={
        "error_type": "Faux",
        "message": "ligne1\nligne2\x1b[91m",
        "path": "/",
    })
    bugs = client.get("/api/admin/status", headers=auth_headers).json()["recent_bugs"]
    assert bugs, "le bug doit bien être enregistré"
    assert "\n" not in bugs[0]["message"]
    assert "\x1b" not in bugs[0]["message"]


# ---------------------------------------------------------------------------
# S7 — Endpoints publics d'écriture sans limite
# ---------------------------------------------------------------------------

def test_public_collect_endpoints_are_rate_limited(client):
    """
    Avant correctif : /api/analytics/collect n'avait aucun plafond, on pouvait
    fausser les statistiques et faire enfler la base sans limite.
    """
    codes = {client.post("/api/analytics/collect", json={"path": "/"}).status_code for _ in range(200)}
    assert 429 in codes, "la collecte publique doit être plafonnée"


def test_bug_report_is_rate_limited(client):
    codes = {client.post("/api/bugs/report", json={"message": "x"}).status_code for _ in range(200)}
    assert 429 in codes


# ---------------------------------------------------------------------------
# S8 — Injection HTML dans l'e-mail de contact
# ---------------------------------------------------------------------------

def test_contact_email_html_is_escaped(client, monkeypatch):
    """
    Avant correctif : les champs du formulaire étaient interpolés bruts dans le
    corps HTML, ce qui permettait d'insérer un lien de phishing cliquable dans
    la boîte du destinataire.
    """
    import app.routers.contact as contact_module

    envoye = {}

    class FakeSMTP:
        def __init__(self, *a, **k):
            pass
        def starttls(self):
            pass
        def login(self, *a):
            pass
        def send_message(self, msg):
            envoye["msg"] = msg
        def quit(self):
            pass

    monkeypatch.setattr(contact_module.smtplib, "SMTP", FakeSMTP)
    monkeypatch.setattr(contact_module, "is_smtp_configured", lambda: True)

    res = client.post("/api/contact", json={
        "name": "Recruteur",
        "email": "attaquant@example.com",
        "message": '<a href="https://phishing.evil/login">Validez votre compte</a>',
    })
    assert res.status_code == 200

    html_part = envoye["msg"].get_payload()[1].get_payload(decode=True).decode()
    assert '<a href="https://phishing.evil/login">' not in html_part
    assert "&lt;a href=" in html_part


# ---------------------------------------------------------------------------
# B1 — Perte de logs à l'archivage (collision jour/mois)
# ---------------------------------------------------------------------------

def test_archive_does_not_match_other_months(tmp_path):
    """
    Avant correctif : la recherche `"-09-" in nom` matchait le *jour* 09 autant
    que le mois 09. Archiver septembre embarquait — et supprimait — les logs du
    9 mars, et inversement.
    """
    from scripts.log_manager import find_logs_for_month

    logs = tmp_path / "logs"
    logs.mkdir()
    for name in [
        "mercredi-09-septembre.2026.log",
        "jeudi-03-septembre.2026.log",
        "mardi-03-mars.2026.log",
        "lundi-09-mars.2026.log",
        "mardi-09-septembre.2025.log",
        "portfolio.log",
    ]:
        (logs / name).write_text("x")

    septembre = sorted(p.name for p in find_logs_for_month(logs, 2026, 9))
    assert septembre == ["jeudi-03-septembre.2026.log", "mercredi-09-septembre.2026.log"]

    mars = sorted(p.name for p in find_logs_for_month(logs, 2026, 3))
    assert mars == ["lundi-09-mars.2026.log", "mardi-03-mars.2026.log"]

    # portfolio.log ne doit jamais être archivé, et l'année doit être exacte.
    assert all("portfolio.log" not in n for n in septembre + mars)
    assert "mardi-09-septembre.2025.log" not in septembre


def test_archive_ignores_invalid_month(tmp_path):
    from scripts.log_manager import find_logs_for_month
    logs = tmp_path / "logs"
    logs.mkdir()
    (logs / "mercredi-09-septembre.2026.log").write_text("x")
    assert find_logs_for_month(logs, 2026, 0) == []
    assert find_logs_for_month(logs, 2026, 13) == []


# ---------------------------------------------------------------------------
# B3 — days non borné sur les statistiques
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("days,expected", [(0, 422), (-5, 422), (3000, 422), (366, 422), (365, 200), (1, 200)])
def test_analytics_days_is_bounded(client, auth_headers, days, expected):
    """
    Avant correctif : days=3000 exécutait 6 000 requêtes SQL (4,4 s), et une
    valeur négative renvoyait un graphique vide sans erreur.
    """
    res = client.get(f"/api/admin/analytics/stats?days={days}", headers=auth_headers)
    assert res.status_code == expected


# ---------------------------------------------------------------------------
# B4 — Codes ANSI écrits dans les fichiers de log
# ---------------------------------------------------------------------------

def test_log_files_contain_no_ansi_codes(tmp_path):
    """
    Avant correctif : `use_color` s'appliquait aussi aux handlers fichier, donc
    les .log contenaient des séquences ANSI que le frontend devait nettoyer.
    """
    from app.logger import setup_logger

    log_path = tmp_path / "test.log"
    logger = setup_logger(name="test_no_ansi", log_file=str(log_path))
    logger.info("message de test", extra={"custom_filename": "t.py", "custom_func": "f", "is_error": False})
    logger.error("erreur de test", extra={"custom_filename": "t.py", "custom_func": "f", "is_error": True})
    for handler in logger.handlers:
        handler.flush()

    contenu = log_path.read_text(encoding="utf-8")
    assert "\x1b" not in contenu
    assert "[92m" not in contenu and "[91m" not in contenu
    assert "[t.py](f)-----message de test" in contenu


# ---------------------------------------------------------------------------
# S13 — Documentation OpenAPI fermée par défaut
# ---------------------------------------------------------------------------

def test_openapi_docs_are_closed_by_default(client):
    """ENABLE_DOCS et DEBUG sont faux dans les tests : /docs doit répondre 404."""
    assert client.get("/docs").status_code == 404
    assert client.get("/redoc").status_code == 404
    assert client.get("/openapi.json").status_code == 404


# ---------------------------------------------------------------------------
# Surface d'import : ce que l'image Docker doit contenir
# ---------------------------------------------------------------------------

def test_app_only_imports_packaged_modules():
    """
    app/routers/status.py importe scripts.log_manager. Le Dockerfile ne copiait
    que `app/`, donc l'image levait ModuleNotFoundError dès l'import de
    app.main : le conteneur backend ne démarrait pas du tout.

    Ce test recense les paquets locaux dont app/ dépend, et vérifie que le
    Dockerfile les copie tous.
    """
    import ast
    from pathlib import Path

    backend_root = Path(__file__).resolve().parent.parent
    local_packages = {
        entry.name
        for entry in backend_root.iterdir()
        if entry.is_dir() and (entry / "__init__.py").exists()
    }

    requis = set()
    for source in (backend_root / "app").rglob("*.py"):
        tree = ast.parse(source.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                requis.update(a.name.split(".")[0] for a in node.names)
            elif isinstance(node, ast.ImportFrom) and node.module and node.level == 0:
                requis.add(node.module.split(".")[0])

    requis &= local_packages
    assert "scripts" in requis, "le test doit détecter la dépendance à scripts/"

    dockerfile = (backend_root / "Dockerfile").read_text(encoding="utf-8")
    for package in sorted(requis):
        assert f"COPY {package} ./{package}" in dockerfile, (
            f"le paquet '{package}' est importé par app/ mais absent du Dockerfile"
        )
