"""
Primitives de sécurité partagées par tous les routeurs.

Ce module existe pour supprimer trois duplications qui étaient aussi trois
sources de bugs :
  - l'extraction de l'IP client était recopiée à l'identique dans 6 fichiers,
    ce qui rendait la faille de contournement du rate-limit pénible à corriger ;
  - trois limiteurs de débit quasi identiques cohabitaient (auth.py, contact.py,
    server.js) et un seul purgeait ses entrées expirées ;
  - aucune neutralisation des entrées utilisateur avant écriture dans les logs.
"""
import re
import time
import threading
from pathlib import Path
from typing import Dict, Optional, Tuple

from fastapi import HTTPException, Request, status

from app.config import settings

# ---------------------------------------------------------------------------
# IP client
# ---------------------------------------------------------------------------

def get_client_ip(request: Request) -> str:
    """
    Retourne l'IP de l'appelant, en tenant compte des proxys de confiance.

    `X-Forwarded-For` est écrit par le client puis complété par chaque proxy
    traversé : la liste est donc « valeurs forgées par le client, puis une
    entrée ajoutée par chaque proxy ». Prendre la première entrée — ce que
    faisait le code précédent — revenait à lire une valeur choisie par le
    visiteur, qui pouvait ainsi remettre à zéro les compteurs anti-brute-force
    à chaque requête.

    Avec N proxys de confiance, la seule entrée fiable est la N-ième en partant
    de la fin : tout ce qui se trouve à sa gauche a pu être inventé.

    Exemple avec TRUSTED_PROXY_HOPS=2 (nginx puis le relais de server.js) :

        X-Forwarded-For: 1.2.3.4, 90.90.90.90, 172.18.0.3
                         ^inventé  ^vrai       ^nginx
                                   |
                                   parts[-2] : l'IP retenue
    """
    hops = settings.TRUSTED_PROXY_HOPS
    if hops > 0:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            parts = [p.strip() for p in forwarded.split(",") if p.strip()]
            if len(parts) >= hops:
                return parts[-hops]
            # Moins d'entrées que de sauts attendus : la chaîne n'est pas celle
            # qu'on croit, on retombe sur la valeur sûre plutôt que d'inventer.
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()

    return request.client.host if request.client else "unknown"


# ---------------------------------------------------------------------------
# Limitation de débit
# ---------------------------------------------------------------------------

class RateLimiter:
    """
    Limiteur en mémoire, à fenêtre fixe, partagé par toutes les routes publiques.

    Deux différences avec les implémentations précédentes :
      - les entrées expirées sont purgées à chaque appel (`_prune`), sinon le
        dictionnaire grossissait indéfiniment ;
      - `MAX_TRACKED_KEYS` plafonne la mémoire même en cas d'attaque distribuée.
    """

    MAX_TRACKED_KEYS = 10_000

    def __init__(self, max_attempts: int, window_seconds: int, name: str = "generic"):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.name = name
        self._hits: Dict[str, Tuple[float, int]] = {}
        self._lock = threading.Lock()

    def _prune(self, now: float) -> None:
        """Retire les fenêtres expirées. Appelé sous verrou."""
        expired = [k for k, (start, _) in self._hits.items() if now - start > self.window_seconds]
        for k in expired:
            self._hits.pop(k, None)

        # Garde-fou mémoire : si le nettoyage ne suffit pas (attaque distribuée),
        # on repart de zéro plutôt que de laisser le processus enfler.
        if len(self._hits) > self.MAX_TRACKED_KEYS:
            self._hits.clear()

    def check(self, key: str) -> Optional[int]:
        """
        Retourne None si l'appel est autorisé, sinon le nombre de secondes
        restant avant la fin de la fenêtre. N'incrémente pas le compteur.
        """
        now = time.time()
        with self._lock:
            self._prune(now)
            record = self._hits.get(key)
            if not record:
                return None
            start, count = record
            if count >= self.max_attempts:
                return max(1, int(self.window_seconds - (now - start)))
            return None

    def hit(self, key: str) -> int:
        """Enregistre une tentative et retourne le total sur la fenêtre courante."""
        now = time.time()
        with self._lock:
            self._prune(now)
            record = self._hits.get(key)
            if not record or (now - record[0]) > self.window_seconds:
                self._hits[key] = (now, 1)
                return 1
            self._hits[key] = (record[0], record[1] + 1)
            return record[1] + 1

    def reset(self, key: str) -> None:
        """Efface le compteur d'une clé (appelé après une connexion réussie)."""
        with self._lock:
            self._hits.pop(key, None)

    def clear(self) -> None:
        """Vide entièrement le limiteur (utilisé par les tests)."""
        with self._lock:
            self._hits.clear()

    def enforce(self, key: str, detail: str = "Trop de requêtes.") -> None:
        """Vérifie puis incrémente, et lève un 429 si la limite est atteinte."""
        remaining = self.check(key)
        if remaining is not None:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"{detail} Réessayez dans {remaining} secondes.",
            )
        self.hit(key)


# Limiteur des routes publiques d'écriture (analytics, rapports de bugs), qui
# n'en avaient aucun et pouvaient donc être inondées sans limite.
public_write_limiter = RateLimiter(max_attempts=120, window_seconds=60, name="public_write")


# ---------------------------------------------------------------------------
# Neutralisation des entrées utilisateur avant journalisation
# ---------------------------------------------------------------------------

# Séquences d'échappement ANSI + caractères de contrôle (dont \r et \n).
# Sans ce filtrage, un visiteur anonyme pouvait injecter une ligne complète
# dans la console de logs admin, par exemple une fausse connexion réussie.
_LOG_UNSAFE_RE = re.compile(r"\x1b\[[0-9;]*[A-Za-z]|[\x00-\x1f\x7f]")


def sanitize_log_value(value: object, max_length: int = 250) -> str:
    """Rend une valeur contrôlée par le client sûre pour une ligne de log."""
    text = "" if value is None else str(value)
    text = _LOG_UNSAFE_RE.sub(" ", text)
    text = " ".join(text.split())  # espaces multiples -> un seul
    if len(text) > max_length:
        text = text[:max_length] + "…"
    return text


# ---------------------------------------------------------------------------
# Résolution de chemin confinée
# ---------------------------------------------------------------------------

def resolve_inside(base_dir: Path, candidate: Optional[str]) -> Optional[Path]:
    """
    Résout `candidate` à l'intérieur de `base_dir`, ou retourne None.

    Deux pièges couverts :
      - `Path("/app/logs") / "/etc/passwd"` donne `/etc/passwd` : un chemin
        absolu remplace entièrement la base. On ne garde donc que le nom de
        fichier final ;
      - une fois le chemin construit, on revérifie après `resolve()` qu'il est
        bien sous la base, pour couvrir les liens symboliques.
    """
    if not candidate:
        return None

    # `Path(...).name` élimine d'un coup les chemins absolus et les "../".
    leaf = Path(candidate).name
    if not leaf or leaf in (".", ".."):
        return None

    target = (base_dir / leaf).resolve()
    try:
        target.relative_to(base_dir.resolve())
    except ValueError:
        return None
    return target
