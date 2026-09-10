import sys
import logging
from logging.handlers import RotatingFileHandler
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


FRENCH_DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
FRENCH_MONTHS = [
    "", "janvier", "fevrier", "mars", "avril", "mai", "juin",
    "juillet", "aout", "septembre", "octobre", "novembre", "decembre"
]

def get_daily_log_filename(dt: Optional[datetime] = None) -> str:
    """
    Génère le nom de fichier de log quotidien selon la nomenclature requise :
    Jour-chiffre-mois.année.log (ex: mercredi-09-septembre.2026.log)
    """
    target_dt = dt or datetime.now()
    day_name = FRENCH_DAYS[target_dt.weekday()]
    day_num = target_dt.strftime("%d")
    month_name = FRENCH_MONTHS[target_dt.month]
    year = target_dt.strftime("%Y")
    return f"{day_name}-{day_num}-{month_name}.{year}.log"

def get_monthly_archive_filename(year: int, month: int) -> str:
    """Génère le nom de l'archive mensuelle .tar.gz (ex: logs-septembre.2026.tar.gz)."""
    month_name = FRENCH_MONTHS[month] if 1 <= month <= 12 else str(month)
    return f"logs-{month_name}.{year}.tar.gz"


def _build_file_handler(path: str) -> logging.Handler:
    """
    Handler fichier avec rotation par taille.

    portfolio.log est explicitement exclu de l'archivage mensuel
    (log_manager.find_logs_for_month) : sans rotation, rien ne le tronquait
    jamais et il grossissait tant que le serveur tournait.
    """
    handler = RotatingFileHandler(
        path,
        maxBytes=settings.LOG_MAX_BYTES,
        backupCount=settings.LOG_BACKUP_COUNT,
        encoding="utf-8",
    )
    handler.setLevel(logging.DEBUG)
    handler.setFormatter(PortfolioLogFormatter(use_color=False))
    return handler


def setup_logger(
    name: str = "portfolio_logger",
    log_file: Optional[str] = None,
    use_color: bool = True
) -> logging.Logger:
    """Initialise un logger avec Formatter personnalisé console et fichier .log quotidien."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Réinitialise les handlers existants pour éviter les doublons
    logger.handlers.clear()

    # Handler Console (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(PortfolioLogFormatter(use_color=use_color))
    logger.addHandler(console_handler)

    # Handler Fichier Quotidien (.log)
    # use_color=False sur les handlers fichier : la couleur ANSI n'a de sens que
    # sur un terminal. Écrite dans le .log, elle obligeait le panel admin à
    # nettoyer chaque ligne à l'affichage, et faisait dépendre les filtres
    # d'erreur d'un artefact de présentation ("[91m").
    target_file = log_file or str(Path(settings.LOG_FILE).parent / get_daily_log_filename())
    if target_file:
        log_path = Path(target_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = _build_file_handler(str(log_path))
        logger.addHandler(file_handler)

        # Si le fichier cible est le fichier quotidien, alimenter également portfolio.log pour faciliter le live tailing
        if not log_file and target_file != settings.LOG_FILE:
            logger.addHandler(_build_file_handler(settings.LOG_FILE))

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
