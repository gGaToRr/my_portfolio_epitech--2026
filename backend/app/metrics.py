import time
import json
import socket
import subprocess
import platform
import threading
from pathlib import Path
from datetime import datetime, timezone, timedelta, date
from typing import Dict, Any, List, Optional
from collections import deque
from sqlalchemy import text, func
from app.config import settings, DATA_DIR
from app.database import engine, SessionLocal
from app.models import DailyUptimeLog

START_TIME = time.time()
START_DATETIME = datetime.now(timezone.utc)
HEARTBEAT_FILE = DATA_DIR / "heartbeat.json"
FIRST_START_FILE = DATA_DIR / "first_started_at.json"

class SystemMetricsTracker:
    def __init__(self, max_recent_errors: int = 50):
        self.start_time: float = START_TIME
        self.start_datetime: datetime = START_DATETIME
        self.total_requests: int = 0
        self.successful_requests: int = 0  # 2xx, 3xx
        self.client_errors: int = 0        # 4xx
        self.server_errors: int = 0        # 5xx
        self.recent_errors: deque = deque(maxlen=max_recent_errors)
        # Compteur monotone : `len(recent_errors) + 1` plafonnait à 51 une fois
        # le deque plein, et tous les bugs suivants recevaient le même id.
        self._bug_sequence: int = 0
        
        # Tracking journalier en direct
        self.daily_metrics: Dict[str, Dict[str, int]] = {}
        self._lock = threading.Lock()

        # Cache court du scan Docker : `docker ps` est un sous-processus, et
        # get_status_summary() en lançait deux par requête (un pour lui, un pour
        # get_daily_history()). Sur une route publique interrogée toutes les
        # 10 s, cela faisait autant de processus créés pour rien.
        self._docker_cache: Optional[Dict[str, Dict[str, Any]]] = None
        self._docker_cache_at: float = 0.0
        self.DOCKER_CACHE_TTL = 5.0

        # Initialisation du heartbeat et détection d'arrêt passé
        self._init_heartbeat_system()

        # Calculé une seule fois par processus : voir _ensure_first_started_at().
        self.first_started_date: date = self._ensure_first_started_at()

    def _get_today_str(self) -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    def _init_heartbeat_system(self):
        """Vérifie si une interruption a eu lieu entre le dernier arrêt et ce démarrage, puis lance le heartbeat."""
        now_ts = time.time()
        now_dt = datetime.now(timezone.utc)
        
        if HEARTBEAT_FILE.exists():
            try:
                with open(HEARTBEAT_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                last_ts = data.get("last_heartbeat", now_ts)
                last_dt_str = data.get("last_datetime", now_dt.strftime("%Y-%m-%d %H:%M:%S"))
                
                gap_seconds = now_ts - last_ts
                if gap_seconds > 180:
                    downtime_minutes = int(gap_seconds // 60)
                    hours, mins = divmod(downtime_minutes, 60)
                    time_str = f"{hours}h{mins:02d}m" if hours > 0 else f"{mins} min"
                    
                    last_date = datetime.strptime(last_dt_str.split()[0], "%Y-%m-%d").date() if " " in last_dt_str else now_dt.date()
                    today_date = now_dt.date()

                    session = SessionLocal()
                    try:
                        if last_date < today_date:
                            day_pct = max(0.0, round(100.0 - (gap_seconds / 86400.0 * 100.0), 1))
                            for svc_name in ["backend", "api", "general"]:
                                past_log = session.query(DailyUptimeLog).filter_by(date_str=str(last_date), service=svc_name).first()
                                if not past_log:
                                    session.add(DailyUptimeLog(
                                        date_str=str(last_date),
                                        service=svc_name,
                                        status="degraded" if day_pct > 80 else "outage",
                                        uptime_percentage=day_pct,
                                        details=f"Interruption serveur ({time_str} d'arrêt)"
                                    ))
                            session.commit()
                    except Exception:
                        pass
                    finally:
                        session.close()
            except Exception:
                pass

        self._save_heartbeat()
        self._heartbeat_thread = threading.Thread(target=self._heartbeat_worker, daemon=True)
        self._heartbeat_thread.start()

    def _save_heartbeat(self):
        try:
            now_dt = datetime.now(timezone.utc)
            with open(HEARTBEAT_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "last_heartbeat": time.time(),
                    "last_datetime": now_dt.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "last_date_str": now_dt.strftime("%Y-%m-%d"),
                }, f)
        except Exception:
            pass

    def _heartbeat_worker(self):
        while True:
            time.sleep(30)
            self._save_heartbeat()

    def today_server_errors(self) -> int:
        """
        Erreurs 500 du jour courant, pas depuis le dernier démarrage.

        check_backend_health(), check_api_health() et get_status_summary()
        utilisaient self.server_errors (cumulé depuis le démarrage du
        processus) pour décider si un service est "degraded", alors que les
        barres d'historique du jour (get_daily_history) se basaient sur
        self.daily_metrics du jour — deux compteurs différents pour la même
        question. Résultat : une icône orange/rouge pouvait rester affichée
        des heures après un incident isolé et résolu, alors que la barre du
        jour, elle, ne bougeait pas ; ou l'inverse. Un seul et même compteur
        (celui du jour) tranche maintenant partout.
        """
        with self._lock:
            today = self._get_today_str()
            return self.daily_metrics.get(today, {}).get("server_errors", 0)

    def record_request(self, status_code: int):
        with self._lock:
            self.total_requests += 1
            today = self._get_today_str()
            if today not in self.daily_metrics:
                self.daily_metrics[today] = {"total": 0, "successful": 0, "client_errors": 0, "server_errors": 0}

            self.daily_metrics[today]["total"] += 1

            if status_code < 400:
                self.successful_requests += 1
                self.daily_metrics[today]["successful"] += 1
            elif status_code < 500:
                self.client_errors += 1
                self.daily_metrics[today]["client_errors"] += 1
            else:
                self.server_errors += 1
                self.daily_metrics[today]["server_errors"] += 1

    def record_bug(self, error_type: str, message: str, path: str = "/", client_ip: str = "unknown"):
        with self._lock:
            self._bug_sequence += 1
            bug_entry = {
                "id": self._bug_sequence,
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                "error_type": error_type,
                "message": message[:500],
                "path": path,
                "client_ip": client_ip,
            }
            self.recent_errors.appendleft(bug_entry)

    def clear_bugs(self):
        with self._lock:
            self.recent_errors.clear()

    def get_uptime_seconds(self) -> int:
        return int(time.time() - self.start_time)

    def get_uptime_human(self) -> str:
        seconds = self.get_uptime_seconds()
        days, rem = divmod(seconds, 86400)
        hours, rem = divmod(rem, 3600)
        minutes, sec = divmod(rem, 60)
        
        parts = []
        if days > 0:
            parts.append(f"{days} jour{'s' if days > 1 else ''}")
        if hours > 0 or days > 0:
            parts.append(f"{hours} heure{'s' if hours > 1 else ''}")
        if minutes > 0 or hours > 0 or days > 0:
            parts.append(f"{minutes} minute{'s' if minutes > 1 else ''}")
        parts.append(f"{sec} seconde{'s' if sec > 1 else ''}")
        return ", ".join(parts)

    def _get_docker_containers(self) -> Dict[str, Dict[str, Any]]:
        """Scanne les conteneurs Docker présents et leur état (résultat mis en cache)."""
        now = time.time()
        if self._docker_cache is not None and (now - self._docker_cache_at) < self.DOCKER_CACHE_TTL:
            return self._docker_cache

        containers = {}
        try:
            res = subprocess.run(
                ["docker", "ps", "-a", "--format", "{{.Names}}|||{{.State}}|||{{.Status}}|||{{.Image}}|||{{.Ports}}"],
                capture_output=True,
                text=True,
                timeout=1.2
            )
            if res.returncode == 0:
                for line in res.stdout.strip().splitlines():
                    if not line.strip():
                        continue
                    parts = line.split("|||")
                    if len(parts) >= 3:
                        name = parts[0]
                        state = parts[1].lower()
                        status_str = parts[2]
                        image = parts[3] if len(parts) > 3 else ""
                        ports = parts[4] if len(parts) > 4 else ""
                        containers[name] = {
                            "name": name,
                            "state": state,
                            "status_str": status_str,
                            "image": image,
                            "ports": ports,
                            "is_running": (state == "running")
                        }
        except Exception:
            pass

        self._docker_cache = containers
        self._docker_cache_at = now
        return containers

    def _probe_tcp_port(self, port: int, host: str = "127.0.0.1", timeout: float = 0.4) -> tuple[bool, Optional[float]]:
        t0 = time.time()
        try:
            with socket.create_connection((host, port), timeout=timeout):
                return True, round((time.time() - t0) * 1000, 2)
        except Exception:
            return False, None

    def check_db_health(self) -> Dict[str, Any]:
        """Vérifie la santé de la base SQLite et la latence réelle."""
        t0 = time.time()
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            latency_ms = round((time.time() - t0) * 1000, 2)
            return {
                "status": "connected",
                "latency_ms": latency_ms,
                "type": "SQLite",
                "label": f"SQLite connectée • Latence {latency_ms} ms",
                "is_active": True
            }
        except Exception as e:
            return {
                "status": "disconnected",
                "error": str(e),
                "type": "SQLite",
                "label": "Base de données inaccessible",
                "is_active": False
            }

    def check_backend_health(self, docker_containers: Optional[Dict[str, Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Détecte l'état du serveur backend FastAPI (Conteneur Docker ou Processus)."""
        if docker_containers is None:
            docker_containers = self._get_docker_containers()

        api_docker = docker_containers.get("portfolio_backend") or next(
            (c for c in docker_containers.values() if "backend" in c["name"].lower() or "backend" in c["image"].lower()),
            None
        )

        is_docker_running = api_docker is not None and api_docker.get("is_running", False)
        server_errs = self.today_server_errors()

        if is_docker_running:
            label = f"Docker actif ({api_docker['name']}) • Port {settings.API_PORT}"
            status = "operational" if server_errs == 0 else "degraded"
            is_active = True
        else:
            label = f"FastAPI actif • Processus Host (Port {settings.API_PORT})"
            status = "operational" if server_errs == 0 else "degraded"
            is_active = True

        return {
            "status": status,
            "is_active": is_active,
            "is_docker": is_docker_running,
            "container_name": api_docker["name"] if api_docker else None,
            "docker_state": api_docker["state"] if api_docker else "host",
            "port": settings.API_PORT,
            "label": label,
        }

    def check_api_health(self) -> Dict[str, Any]:
        """Surveille le trafic et les endpoints de l'API (requêtes, succès, erreurs)."""
        total = self.total_requests
        successful = self.successful_requests
        server_errs = self.today_server_errors()

        if total > 0:
            success_rate = f"{round((successful / total) * 100, 2)}%"
        else:
            success_rate = "100.0%"

        # Même seuil que la barre du jour dans get_daily_history() : un taux de
        # succès (pas un nombre brut d'erreurs) sur les requêtes du jour, sinon
        # les deux pouvaient trancher différemment pour le même incident.
        with self._lock:
            today_total = self.daily_metrics.get(self._get_today_str(), {}).get("total", 0)
        today_success_pct = round(((today_total - server_errs) / max(today_total, 1)) * 100, 2) if today_total else 100.0

        if server_errs == 0:
            status = "operational"
        else:
            status = "degraded" if today_success_pct >= 95.0 else "outage"
        label = f"{total} requête{'s' if total > 1 else ''} traitée{'s' if total > 1 else ''} ({success_rate} succès)"

        return {
            "status": status,
            "is_active": True,
            "total_requests": total,
            "successful_requests": successful,
            "server_errors": server_errs,
            "success_rate": success_rate,
            "label": label,
        }

    def check_frontend_health(self, docker_containers: Optional[Dict[str, Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Détecte l'état du frontend React (Docker ou Serveur de dev)."""
        if docker_containers is None:
            docker_containers = self._get_docker_containers()

        front_docker = docker_containers.get("pierre_portfolio") or next(
            (c for c in docker_containers.values() if "portfolio" in c["name"].lower() or "portfo" in c["name"].lower() or "react" in c["name"].lower()),
            None
        )

        is_docker_running = front_docker is not None and front_docker.get("is_running", False)
        is_port_open, latency = self._probe_tcp_port(3006)

        if is_docker_running:
            status = "operational"
            is_active = True
            label = f"Docker actif ({front_docker['name']}) • Port 3006"
        elif is_port_open:
            status = "operational"
            is_active = True
            label = f"React SPA actif • Port 3006 ({latency} ms)"
        elif front_docker and not front_docker.get("is_running", False):
            status = "outage"
            is_active = False
            label = f"Conteneur Docker ({front_docker['name']}) éteint"
        else:
            status = "operational"
            is_active = True
            label = "Interface Web disponible"

        return {
            "status": status,
            "is_active": is_active,
            "is_docker": is_docker_running,
            "container_name": front_docker["name"] if front_docker else None,
            "docker_state": front_docker["state"] if front_docker else ("running" if is_port_open else "stopped"),
            "port": 3006,
            "latency_ms": latency,
            "label": label,
        }

    def check_smtp_health(self, docker_containers: Optional[Dict[str, Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Détecte si le conteneur Docker SMTP ou le serveur SMTP est allumé/actif."""
        if docker_containers is None:
            docker_containers = self._get_docker_containers()

        smtp_docker = next(
            (c for c in docker_containers.values() if any(kw in c["name"].lower() or kw in c["image"].lower() for kw in ["smtp", "mail", "postfix", "mailhog", "mailpit", "maildev"])),
            None
        )

        is_docker_running = smtp_docker is not None and smtp_docker.get("is_running", False)

        host = settings.SMTP_HOST or "127.0.0.1"
        port = settings.SMTP_PORT or 587
        ports_to_try = [port]
        if not settings.SMTP_HOST:
            ports_to_try = [587, 1025, 25, 465]

        socket_connected = False
        connected_port = None
        latency_ms = None

        for p in ports_to_try:
            is_open, lat = self._probe_tcp_port(p, host=host, timeout=0.4)
            if is_open:
                socket_connected = True
                connected_port = p
                latency_ms = lat
                break

        is_active = is_docker_running or socket_connected

        if is_active:
            status = "operational"
            if is_docker_running and socket_connected:
                label = f"Docker actif ({smtp_docker['name']}) • Port {connected_port} ({latency_ms} ms)"
            elif is_docker_running:
                label = f"Docker actif ({smtp_docker['name']})"
            else:
                label = f"Connecté • Port {connected_port} ({latency_ms} ms)"
        else:
            status = "outage"
            if smtp_docker:
                label = f"Conteneur Docker ({smtp_docker['name']}) éteint"
            else:
                label = "Conteneur Docker SMTP éteint (Inactif)"

        return {
            "status": status,
            "is_active": is_active,
            "is_docker": is_docker_running,
            "container_name": smtp_docker["name"] if smtp_docker else None,
            "docker_state": smtp_docker["state"] if smtp_docker else "not_found",
            "socket_connected": socket_connected,
            "port": connected_port or port,
            "latency_ms": latency_ms,
            "label": label,
        }

    def get_system_start_date(self) -> date:
        """Date de mise en service, stable à travers les redémarrages (voir _ensure_first_started_at)."""
        return self.first_started_date

    def _ensure_first_started_at(self) -> date:
        """
        Date de premier démarrage du système, persistée une seule fois.

        L'ancienne version se rabattait sur le DailyUptimeLog le plus ancien —
        qui n'existe que si une coupure a déjà été détectée par le heartbeat.
        Un service qui tourne sans interruption n'en écrit jamais aucun, donc
        le repli utilisait la date de démarrage du *processus courant*
        (START_DATETIME), qui change à chaque redémarrage. Un simple
        redéploiement suffisait alors à faire "perdre" plusieurs jours
        d'historique affichés, sans qu'aucune donnée ne soit réellement
        perdue : seul ce repère de date se réinitialisait.
        """
        if FIRST_START_FILE.exists():
            try:
                with open(FIRST_START_FILE, "r", encoding="utf-8") as f:
                    stored = json.load(f).get("first_started_at")
                if stored:
                    return datetime.strptime(stored, "%Y-%m-%d").date()
            except Exception:
                pass

        # Premier démarrage avec ce marqueur : on essaie de retrouver une
        # activité déjà ancienne plutôt que d'amorcer bêtement sur "aujourd'hui"
        # un système qui tournait peut-être depuis plusieurs jours.
        recovered = self._find_earliest_known_activity()
        resolved = recovered or self.start_datetime.date()

        try:
            with open(FIRST_START_FILE, "w", encoding="utf-8") as f:
                json.dump({"first_started_at": resolved.strftime("%Y-%m-%d")}, f)
        except Exception:
            pass
        return resolved

    def _find_earliest_known_activity(self) -> Optional[date]:
        """Meilleure estimation dispo pour amorcer first_started_at une seule fois."""
        session = SessionLocal()
        try:
            from app.models import PageView
            earliest_view = session.query(func.min(PageView.timestamp)).scalar()
            if earliest_view:
                return earliest_view.date()
        except Exception:
            pass
        finally:
            session.close()

        try:
            log_files = list(Path(settings.LOG_FILE).parent.glob("*.log"))
            if log_files:
                oldest = min(log_files, key=lambda p: p.stat().st_mtime)
                return datetime.fromtimestamp(oldest.stat().st_mtime, tz=timezone.utc).date()
        except Exception:
            pass

        return None

    def get_daily_history(
        self,
        max_days: int = 65,
        health: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Génère l'historique du premier jour de configuration jusqu'à aujourd'hui.

        `health` permet de réutiliser les sondes déjà calculées par
        get_status_summary(). Sans lui, les cinq sondes (base, backend, API,
        frontend, SMTP — dont jusqu'à cinq connexions TCP) étaient exécutées une
        seconde fois pour la même requête.
        """
        today_date = datetime.now(timezone.utc).date()
        start_date = self.get_system_start_date()

        days_count = max(1, (today_date - start_date).days + 1)
        days_to_render = min(days_count, max_days)
        
        # Récupération des logs historiques en base avec fermeture garantie
        db_logs_map: Dict[str, Dict[str, DailyUptimeLog]] = {}
        session = SessionLocal()
        try:
            cutoff_date = (today_date - timedelta(days=days_to_render)).strftime("%Y-%m-%d")
            logs = session.query(DailyUptimeLog).filter(DailyUptimeLog.date_str >= cutoff_date).all()
            for log in logs:
                if log.service not in db_logs_map:
                    db_logs_map[log.service] = {}
                db_logs_map[log.service][log.date_str] = log
        except Exception:
            pass
        finally:
            session.close()

        # Sondes réutilisées si l'appelant les a déjà faites, sinon calculées ici.
        if health is None:
            docker_containers = self._get_docker_containers()
            health = {
                "database": self.check_db_health(),
                "backend": self.check_backend_health(docker_containers),
                "api": self.check_api_health(),
                "frontend": self.check_frontend_health(docker_containers),
                "smtp": self.check_smtp_health(docker_containers),
            }

        db_health = health["database"]
        db_is_up = db_health.get("is_active", True)

        backend_health = health["backend"]
        backend_is_up = backend_health.get("is_active", True)

        api_health = health["api"]
        api_is_up = api_health.get("is_active", True)

        front_health = health["frontend"]
        front_is_up = front_health.get("is_active", True)

        smtp_health = health["smtp"]
        smtp_is_up = smtp_health.get("is_active", False)

        history_general = []
        history_backend = []
        history_api = []
        history_db = []
        history_frontend = []
        history_smtp = []

        month_names = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

        for i in range(days_to_render - 1, -1, -1):
            day = today_date - timedelta(days=i)
            day_str = day.strftime("%Y-%m-%d")
            day_formatted = f"{day.day} {month_names[day.month - 1]}"

            is_today = (i == 0)

            # --- Backend Service ---
            # Reprend le statut déjà calculé par check_backend_health() (qui
            # tient compte des erreurs du jour) plutôt que de le recalculer
            # avec un critère différent : sinon l'icône du service et la barre
            # du jour pouvaient afficher deux couleurs différentes pour la
            # même chose au même instant.
            if is_today:
                if not backend_is_up:
                    be_status = "outage"
                    be_pct = 0.0
                    be_label = "Serveur Backend arrêté"
                elif backend_health.get("status") == "degraded":
                    be_status = "degraded"
                    be_pct = round(max(0.0, 100.0 - self.today_server_errors()), 1)
                    be_label = f"Erreurs serveur détectées ({backend_health.get('label')})"
                else:
                    be_status = "operational"
                    be_pct = 100.0
                    be_label = f"100% opérationnel ({backend_health.get('label')})"
            else:
                log_entry = db_logs_map.get("backend", {}).get(day_str)
                if log_entry:
                    be_status = log_entry.status
                    be_pct = log_entry.uptime_percentage
                    be_label = log_entry.details or f"{be_pct}% opérationnel"
                else:
                    be_status = "operational"
                    be_pct = 100.0
                    be_label = "100% opérationnel (0 incident)"

            # --- API Service ---
            if is_today:
                with self._lock:
                    today_metrics = self.daily_metrics.get(day_str, {"total": self.total_requests, "server_errors": self.server_errors})
                    req_count = today_metrics.get("total", 0)
                    srv_errs = today_metrics.get("server_errors", 0)

                if not api_is_up:
                    api_status = "outage"
                    api_pct = 0.0
                    api_label = "Service API arrêté"
                elif srv_errs == 0:
                    api_status = "operational"
                    api_pct = 100.0
                    api_label = f"100% opérationnel ({api_health.get('label')})"
                else:
                    api_pct = round(((req_count - srv_errs) / max(req_count, 1)) * 100, 2)
                    api_status = "degraded" if api_pct >= 95.0 else "outage"
                    api_label = f"{api_pct}% ({srv_errs} erreur serveur)"
            else:
                log_entry = db_logs_map.get("api", {}).get(day_str)
                if log_entry:
                    api_status = log_entry.status
                    api_pct = log_entry.uptime_percentage
                    api_label = log_entry.details or f"{api_pct}% opérationnel"
                else:
                    api_status = "operational"
                    api_pct = 100.0
                    api_label = "100% opérationnel (0 incident)"

            # --- Database Service ---
            if is_today:
                if db_is_up:
                    db_status = "operational"
                    db_pct = 100.0
                    db_label = f"100% opérationnel ({db_health.get('latency_ms', 0.4)} ms)"
                else:
                    db_status = "outage"
                    db_pct = 0.0
                    db_label = "Interruption base de données"
            else:
                log_entry = db_logs_map.get("database", {}).get(day_str)
                if log_entry:
                    db_status = log_entry.status
                    db_pct = log_entry.uptime_percentage
                    db_label = log_entry.details or f"{db_pct}% opérationnel"
                else:
                    db_status = "operational"
                    db_pct = 100.0
                    db_label = "100% opérationnel (Connectée)"

            # --- Frontend Service ---
            if is_today:
                if front_is_up:
                    front_status = "operational"
                    front_pct = 100.0
                    front_label = f"100% opérationnel ({front_health.get('label')})"
                else:
                    front_status = "outage"
                    front_pct = 0.0
                    front_label = "Serveur Web éteint"
            else:
                log_entry = db_logs_map.get("frontend", {}).get(day_str)
                if log_entry:
                    front_status = log_entry.status
                    front_pct = log_entry.uptime_percentage
                    front_label = log_entry.details or f"{front_pct}% opérationnel"
                else:
                    front_status = "operational"
                    front_pct = 100.0
                    front_label = "100% opérationnel (Interface active)"

            # --- SMTP Service ---
            if is_today:
                if smtp_is_up:
                    smtp_status = "operational"
                    smtp_pct = 100.0
                    smtp_label = f"100% opérationnel ({smtp_health.get('label')})"
                else:
                    smtp_status = "outage"
                    smtp_pct = 0.0
                    smtp_label = smtp_health.get("label", "Conteneur Docker SMTP éteint")
            else:
                log_entry = db_logs_map.get("smtp", {}).get(day_str)
                if log_entry:
                    smtp_status = log_entry.status
                    smtp_pct = log_entry.uptime_percentage
                    smtp_label = log_entry.details or f"{smtp_pct}% opérationnel"
                else:
                    smtp_status = "operational" if smtp_is_up else "outage"
                    smtp_pct = 100.0 if smtp_is_up else 0.0
                    smtp_label = "100% opérationnel" if smtp_is_up else "Conteneur Docker SMTP éteint"

            # --- General / Global Service ---
            # Même critère qu'overall_status dans get_status_summary() : un
            # service up mais qui a renvoyé des 500 aujourd'hui n'est pas
            # "100% opérationnel" pour autant, sans quoi la barre du jour et
            # l'icône globale (qui, elle, tient compte des erreurs) se
            # contredisaient sous les yeux de l'admin.
            if is_today:
                core_services_up = backend_is_up and db_is_up and front_is_up
                today_errs = self.today_server_errors()
                if not core_services_up:
                    gen_status = "outage"
                    gen_pct = 0.0
                    gen_label = "Panne critique d'un ou plusieurs services"
                elif today_errs > 0:
                    gen_status = "degraded"
                    gen_pct = round(max(0.0, 100.0 - today_errs), 1)
                    gen_label = f"Erreurs serveur détectées aujourd'hui ({today_errs})"
                else:
                    gen_status = "operational"
                    gen_pct = 100.0
                    gen_label = "100% opérationnel (Services Backend, Web & Données actifs)"
            else:
                log_entry = db_logs_map.get("general", {}).get(day_str)
                if log_entry:
                    gen_status = log_entry.status
                    gen_pct = log_entry.uptime_percentage
                    gen_label = log_entry.details or f"{gen_pct}% opérationnel"
                else:
                    gen_status = "operational"
                    gen_pct = 100.0
                    gen_label = "100% opérationnel (Aucun incident)"

            history_general.append({
                "id": days_to_render - i,
                "date": day_str,
                "date_formatted": day_formatted,
                "status": gen_status,
                "status_label": gen_label,
                "uptime_percentage": gen_pct,
            })
            history_backend.append({
                "id": days_to_render - i,
                "date": day_str,
                "date_formatted": day_formatted,
                "status": be_status,
                "status_label": be_label,
                "uptime_percentage": be_pct,
            })
            history_api.append({
                "id": days_to_render - i,
                "date": day_str,
                "date_formatted": day_formatted,
                "status": api_status,
                "status_label": api_label,
                "uptime_percentage": api_pct,
            })
            history_db.append({
                "id": days_to_render - i,
                "date": day_str,
                "date_formatted": day_formatted,
                "status": db_status,
                "status_label": db_label,
                "uptime_percentage": db_pct,
            })
            history_frontend.append({
                "id": days_to_render - i,
                "date": day_str,
                "date_formatted": day_formatted,
                "status": front_status,
                "status_label": front_label,
                "uptime_percentage": front_pct,
            })
            history_smtp.append({
                "id": days_to_render - i,
                "date": day_str,
                "date_formatted": day_formatted,
                "status": smtp_status,
                "status_label": smtp_label,
                "uptime_percentage": smtp_pct,
            })

        return {
            "general": history_general,
            "backend": history_backend,
            "api": history_api,
            "database": history_db,
            "frontend": history_frontend,
            "smtp": history_smtp,
        }

    def get_status_summary(self) -> Dict[str, Any]:
        with self._lock:
            uptime_sec = self.get_uptime_seconds()
            uptime_str = self.get_uptime_human()
            total = self.total_requests
            successful = self.successful_requests
            client_err = self.client_errors
            server_err = self.server_errors
            recent_bugs = list(self.recent_errors)

        if total > 0:
            success_rate = f"{round((successful / total) * 100, 2)}%"
        else:
            success_rate = "100.0%"

        docker_containers = self._get_docker_containers()
        db_info = self.check_db_health()
        backend_info = self.check_backend_health(docker_containers)
        api_info = self.check_api_health()
        front_info = self.check_frontend_health(docker_containers)
        smtp_info = self.check_smtp_health(docker_containers)
        health = {
            "database": db_info,
            "backend": backend_info,
            "api": api_info,
            "frontend": front_info,
            "smtp": smtp_info,
        }

        is_healthy = db_info.get("is_active", True) and backend_info.get("is_active", True) and self.today_server_errors() == 0
        overall_status = "operational" if is_healthy else ("degraded" if db_info.get("is_active", True) else "critical")
        # On passe les sondes déjà faites plutôt que de les relancer.
        history = self.get_daily_history(max_days=65, health=health)

        return {
            "status": overall_status,
            "uptime_seconds": uptime_sec,
            "uptime_human": uptime_str,
            "started_at": self.start_datetime.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "first_tracked_date": self.get_system_start_date().strftime("%Y-%m-%d"),
            "days_tracked": len(history.get("general", [])),
            "metrics": {
                "total_requests": total,
                "successful_requests": successful,
                "client_errors_4xx": client_err,
                "server_errors_5xx": server_err,
                "success_rate": success_rate,
                "total_bugs_recorded": len(recent_bugs),
            },
            "components": {
                "database": db_info,
                "backend": backend_info,
                "api": api_info,
                "frontend": front_info,
                "smtp": smtp_info,
                "system": {
                    "python_version": platform.python_version(),
                    "platform": platform.system(),
                    "architecture": platform.machine(),
                }
            },
            "history": history,
            "recent_bugs": recent_bugs
        }

metrics_tracker = SystemMetricsTracker()
