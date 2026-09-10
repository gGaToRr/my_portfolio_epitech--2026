"""
Génération et persistance des secrets absents de la configuration.

Quand SECRET_KEY ou ADMIN_PASSWORD ne sont pas fournis par l'environnement,
le serveur les fabrique lui-même avec `secrets` (générateur cryptographique du
système), puis les conserve dans le dossier de données pour qu'ils survivent aux
redémarrages. Aucun secret par défaut n'est donc écrit dans le dépôt.

Une valeur fournie par l'environnement l'emporte toujours : renseigner
ADMIN_PASSWORD dans .env.local désactive complètement la génération.
"""
import json
import os
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Tuple

# Alphabet sans caractères ambigus : le mot de passe est destiné à être relu
# dans un terminal, on retire 0/O, 1/l/I qui se confondent selon la police.
PASSWORD_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
PASSWORD_LENGTH = 24  # ~139 bits d'entropie avec cet alphabet


def generate_password(length: int = PASSWORD_LENGTH) -> str:
    """Mot de passe aléatoire tiré du générateur cryptographique du système."""
    return "".join(secrets.choice(PASSWORD_ALPHABET) for _ in range(length))


def _write_private(path: Path, content: str) -> None:
    """
    Écrit un secret lisible par le seul propriétaire.

    Les permissions sont posées avant l'écriture (via os.open) pour ne pas
    laisser le contenu exposé, même brièvement, entre la création du fichier et
    le chmod.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
        handle.write(content)


def ensure_secret_key(configured: str, data_dir: Path) -> Tuple[str, bool]:
    """
    Retourne la clé de signature JWT à utiliser, et si elle vient d'être créée.

    La clé est persistée : la régénérer à chaque démarrage invaliderait tous les
    jetons en cours et déconnecterait l'administrateur à chaque redéploiement.
    """
    if configured:
        return configured, False

    key_file = data_dir / "secret_key"
    if key_file.exists():
        stored = key_file.read_text(encoding="utf-8").strip()
        if stored:
            return stored, False

    generated = secrets.token_urlsafe(48)
    _write_private(key_file, generated + "\n")
    return generated, True


def ensure_admin_password(configured: str, username: str, data_dir: Path) -> Tuple[str, bool]:
    """
    Retourne le mot de passe administrateur à utiliser, et s'il vient d'être créé.

    Le mot de passe généré est conservé en clair dans data/admin_credentials.json
    (permissions 0600). C'est un compromis assumé : sans ce fichier, un mot de
    passe perdu ne serait plus récupérable qu'en supprimant la base. Le dossier
    data/ est déjà celui de la base SQLite, qui contient les mêmes informations
    sous forme de hash.
    """
    if configured:
        return configured, False

    credentials_file = data_dir / "admin_credentials.json"
    if credentials_file.exists():
        try:
            stored = json.loads(credentials_file.read_text(encoding="utf-8"))
            if stored.get("password") and stored.get("username") == username:
                return stored["password"], False
        except (json.JSONDecodeError, OSError):
            # Fichier illisible ou corrompu : on en régénère un plutôt que de
            # démarrer sans mot de passe utilisable.
            pass

    generated = generate_password()
    _write_private(
        credentials_file,
        json.dumps(
            {
                "username": username,
                "password": generated,
                "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "note": "Genere automatiquement. Definir ADMIN_PASSWORD dans .env.local pour choisir le votre.",
            },
            indent=2,
        )
        + "\n",
    )
    return generated, True


def format_credentials_banner(username: str, password: str, was_generated: bool) -> str:
    """
    Encadré affiché au démarrage, destiné à `docker compose logs`.

    Ce texte part sur la sortie standard uniquement, jamais dans le logger : les
    fichiers .log sont servis par /api/admin/logs/live et conservés dans les
    archives mensuelles, un mot de passe n'a rien à y faire.
    """
    largeur = 64
    origine = (
        "genere automatiquement par le serveur"
        if was_generated
        else "lu depuis data/admin_credentials.json"
    )
    lignes = [
        "=" * largeur,
        "  COMPTE ADMINISTRATEUR".ljust(largeur),
        "-" * largeur,
        f"  Identifiant   : {username}",
        f"  Mot de passe  : {password}",
        "",
        f"  ({origine})",
        "  Pour definir le votre : ADMIN_PASSWORD dans backend/.env.local",
        "=" * largeur,
    ]
    return "\n".join(lignes)
