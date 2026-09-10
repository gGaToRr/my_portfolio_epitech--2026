"""
Tests de la génération des secrets (app/credentials.py).

Le dépôt ne contient plus aucun mot de passe ni clé de signature par défaut :
le serveur les fabrique au premier démarrage et les conserve dans data/.
"""
import json
import os
import stat

import pytest

from app.credentials import (
    PASSWORD_ALPHABET,
    PASSWORD_LENGTH,
    ensure_admin_password,
    ensure_secret_key,
    format_credentials_banner,
    generate_password,
)


def test_generated_password_is_random_and_unambiguous():
    """Longueur fixe, alphabet sans caractères confondables, jamais deux fois le même."""
    tirages = {generate_password() for _ in range(200)}
    assert len(tirages) == 200, "deux tirages identiques : le générateur n'est pas aléatoire"

    for mot in list(tirages)[:20]:
        assert len(mot) == PASSWORD_LENGTH
        assert set(mot) <= set(PASSWORD_ALPHABET)
        # Caractères retirés parce qu'illisibles selon la police du terminal.
        assert not (set(mot) & set("0O1lI"))


def test_secret_key_is_generated_then_reused(tmp_path):
    """La clé doit survivre au redémarrage, sinon tous les jetons seraient invalidés."""
    key1, genere1 = ensure_secret_key("", tmp_path)
    assert genere1 is True
    assert len(key1) >= 40

    key2, genere2 = ensure_secret_key("", tmp_path)
    assert genere2 is False
    assert key2 == key1, "la clé doit être relue, pas régénérée"


def test_configured_secret_key_wins(tmp_path):
    """Une valeur fournie par l'environnement désactive la génération."""
    key, genere = ensure_secret_key("ma-cle-a-moi", tmp_path)
    assert key == "ma-cle-a-moi"
    assert genere is False
    assert not (tmp_path / "secret_key").exists(), "rien ne doit être écrit sur disque"


def test_admin_password_is_generated_then_reused(tmp_path):
    mot1, genere1 = ensure_admin_password("", "admin", tmp_path)
    assert genere1 is True
    assert len(mot1) == PASSWORD_LENGTH

    mot2, genere2 = ensure_admin_password("", "admin", tmp_path)
    assert genere2 is False
    assert mot2 == mot1


def test_configured_admin_password_wins(tmp_path):
    mot, genere = ensure_admin_password("mon-mot-de-passe", "admin", tmp_path)
    assert mot == "mon-mot-de-passe"
    assert genere is False
    assert not (tmp_path / "admin_credentials.json").exists()


@pytest.mark.parametrize("fichier", ["secret_key", "admin_credentials.json"])
def test_secret_files_are_private(tmp_path, fichier):
    """0600 : lisible par le seul propriétaire du processus."""
    ensure_secret_key("", tmp_path)
    ensure_admin_password("", "admin", tmp_path)

    mode = stat.S_IMODE(os.stat(tmp_path / fichier).st_mode)
    assert mode == 0o600, f"{fichier} est en {oct(mode)}, attendu 0o600"


def test_corrupted_credentials_file_is_regenerated(tmp_path):
    """Un fichier illisible ne doit pas empêcher le démarrage."""
    (tmp_path / "admin_credentials.json").write_text("{ ceci n'est pas du json", encoding="utf-8")
    mot, genere = ensure_admin_password("", "admin", tmp_path)
    assert genere is True
    assert len(mot) == PASSWORD_LENGTH
    assert json.loads((tmp_path / "admin_credentials.json").read_text())["password"] == mot


def test_credentials_file_ignored_when_username_changed(tmp_path):
    """Changer ADMIN_USERNAME doit produire un nouveau couple, pas réutiliser l'ancien."""
    mot1, _ = ensure_admin_password("", "admin", tmp_path)
    mot2, genere2 = ensure_admin_password("", "pierre", tmp_path)
    assert genere2 is True
    assert mot2 != mot1
    assert json.loads((tmp_path / "admin_credentials.json").read_text())["username"] == "pierre"


def test_banner_shows_credentials():
    banniere = format_credentials_banner("admin", "MotDePasseTest23", True)
    assert "admin" in banniere
    assert "MotDePasseTest23" in banniere
    assert "ADMIN_PASSWORD" in banniere, "la bannière doit indiquer comment définir le sien"


def test_repository_contains_no_default_credentials():
    """
    Garde-fou : plus aucun mot de passe ni clé en dur dans la configuration.

    C'est ce que corrige cette fonctionnalité — un secret par défaut dans un
    fichier suivi par git est lisible par quiconque a accès au dépôt.
    """
    from pathlib import Path

    config = (Path(__file__).resolve().parent.parent / "app" / "config.py").read_text(encoding="utf-8")
    assert 'SECRET_KEY: str = ""' in config
    assert 'ADMIN_PASSWORD: str = ""' in config
    for ancien in ("admin123", "portfolio_super_secret_jwt_key"):
        assert ancien not in config, f"secret en dur toujours présent : {ancien}"
