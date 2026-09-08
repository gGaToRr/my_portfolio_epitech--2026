import sys
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional
from app.config import settings

COLOR_RED = "\033[91m"
COLOR_GREEN = "\033[92m"
COLOR_RESET = "\033[0m"

class PortfolioLogFormatter(logging.Formatter):
    """
    Formatte strictement chaque ligne de log selon la spécification :
    [YYYY-MM-DD HH:MM:SS][NOM_DE_FICHIER](FONCTIONS)-----Détail de l'erreur ou du log
    Avec coloration Rouge pour les erreurs/warnings et Verte pour les succès/actions/infos.
    """
    def __init__(self, use_color: bool = True, datefmt: str = "%Y-%m-%d %H:%M:%S"):
        super().__init__(datefmt=datefmt)
        self.use_color = use_color

    def format(self, record: logging.LogRecord) -> str:
        filename = getattr(record, "custom_filename", None) or getattr(record, "filename", "unknown.py")
        func_name = getattr(record, "custom_func", None) or getattr(record, "funcName", "unknown")
        timestamp = self.formatTime(record, self.datefmt)
        
        is_error = getattr(record, "is_error", False) or record.levelno >= logging.WARNING

        if self.use_color:
            color = COLOR_RED if is_error else COLOR_GREEN
            reset = COLOR_RESET
        else:
            color = ""
            reset = ""

        detail = record.getMessage()
        return f"{color}[{timestamp}][{filename}]({func_name})-----{detail}{reset}"


def setup_logger(
    name: str = "portfolio_logger",
    log_file: Optional[str] = None,
    use_color: bool = True
) -> logging.Logger:
    """Initialise un logger avec Formatter personnalisé console et fichier .log."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Réinitialise les handlers existants pour éviter les doublons
    logger.handlers.clear()

    # Handler Console (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(PortfolioLogFormatter(use_color=use_color))
    logger.addHandler(console_handler)

    # Handler Fichier (.log)
    target_file = log_file or settings.LOG_FILE
    if target_file:
        log_path = Path(target_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(str(log_path), encoding="utf-8")
        file_handler.setLevel(logging.DEBUG)
        # Écrit les séquences de couleur dans le fichier .log pour rendu immédiat
        file_handler.setFormatter(PortfolioLogFormatter(use_color=use_color))
        logger.addHandler(file_handler)

    return logger

logger = setup_logger()

def _get_timestamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def log_success(filename: str, func_name: str, message: str) -> str:
    """Enregistre un log de succès/action utilisateur (Couleur Verte)."""
    extra = {"custom_filename": filename, "custom_func": func_name, "is_error": False}
    logger.info(message, extra=extra)
    return f"[{_get_timestamp()}][{filename}]({func_name})-----{message}"

def log_error(filename: str, func_name: str, message: str) -> str:
    """Enregistre un log d'erreur/exception (Couleur Rouge)."""
    extra = {"custom_filename": filename, "custom_func": func_name, "is_error": True}
    logger.error(message, extra=extra)
    return f"[{_get_timestamp()}][{filename}]({func_name})-----{message}"

def log_warning(filename: str, func_name: str, message: str) -> str:
    """Enregistre un avertissement/action suspecte (Couleur Rouge)."""
    extra = {"custom_filename": filename, "custom_func": func_name, "is_error": True}
    logger.warning(message, extra=extra)
    return f"[{_get_timestamp()}][{filename}]({func_name})-----{message}"

def log_interaction(filename: str, func_name: str, message: str, is_error: bool = False) -> str:
    """Enregistre une interaction utilisateur sur le site (Vert ou Rouge)."""
    if is_error:
        return log_error(filename, func_name, message)
    return log_success(filename, func_name, message)
