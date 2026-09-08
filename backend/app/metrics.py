import time
import sys
import platform
import threading
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from collections import deque
from sqlalchemy import text
from app.database import engine

START_TIME = time.time()
START_DATETIME = datetime.now(timezone.utc)

class SystemMetricsTracker:
    def __init__(self, max_recent_errors: int = 50):
        self.start_time: float = START_TIME
        self.start_datetime: datetime = START_DATETIME
        self.total_requests: int = 0
        self.successful_requests: int = 0  # 2xx, 3xx
        self.client_errors: int = 0        # 4xx
        self.server_errors: int = 0        # 5xx
        self.recent_errors: deque = deque(maxlen=max_recent_errors)
        self._lock = threading.Lock()

    def record_request(self, status_code: int):
        with self._lock:
            self.total_requests += 1
            if status_code < 400:
                self.successful_requests += 1
            elif status_code < 500:
                self.client_errors += 1
            else:
                self.server_errors += 1

    def record_bug(self, error_type: str, message: str, path: str = "/", client_ip: str = "unknown"):
        with self._lock:
            bug_entry = {
                "id": len(self.recent_errors) + 1,
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

    def check_db_health(self) -> Dict[str, Any]:
        t0 = time.time()
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            latency_ms = round((time.time() - t0) * 1000, 2)
            return {"status": "connected", "latency_ms": latency_ms, "type": "SQLite"}
        except Exception as e:
            return {"status": "disconnected", "error": str(e), "type": "SQLite"}

    def get_status_summary(self) -> Dict[str, Any]:
        with self._lock:
            uptime_sec = self.get_uptime_seconds()
            uptime_str = self.get_uptime_human()
            
            db_info = self.check_db_health()
            
            total = self.total_requests
            if total > 0:
                success_rate_val = round((self.successful_requests / total) * 100, 2)
                success_rate = f"{success_rate_val}%"
            else:
                success_rate = "100.0%"

            is_healthy = db_info["status"] == "connected" and self.server_errors == 0
            overall_status = "operational" if is_healthy else ("degraded" if db_info["status"] == "connected" else "critical")

            return {
                "status": overall_status,
                "uptime_seconds": uptime_sec,
                "uptime_human": uptime_str,
                "started_at": self.start_datetime.strftime("%Y-%m-%d %H:%M:%S UTC"),
                "metrics": {
                    "total_requests": self.total_requests,
                    "successful_requests": self.successful_requests,
                    "client_errors_4xx": self.client_errors,
                    "server_errors_5xx": self.server_errors,
                    "success_rate": success_rate,
                    "total_bugs_recorded": len(self.recent_errors),
                },
                "components": {
                    "database": db_info,
                    "system": {
                        "python_version": platform.python_version(),
                        "platform": platform.system(),
                        "architecture": platform.machine(),
                    }
                },
                "recent_bugs": list(self.recent_errors)
            }

metrics_tracker = SystemMetricsTracker()
