import os
import sys
import tarfile
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

# Ensure backend root is in python path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.logger import (
    get_daily_log_filename,
    get_monthly_archive_filename,
    FRENCH_MONTHS,
    log_success,
    log_error,
    log_warning,
)

def get_logs_directory(custom_dir: Optional[str] = None) -> Path:
    target = Path(custom_dir) if custom_dir else Path(settings.LOG_FILE).parent
    target.mkdir(parents=True, exist_ok=True)
    return target

def get_archives_directory(custom_dir: Optional[str] = None) -> Path:
    target = Path(custom_dir) if custom_dir else Path(settings.LOG_ARCHIVES_DIR)
    target.mkdir(parents=True, exist_ok=True)
    return target

def find_logs_for_month(logs_dir: Path, year: int, month: int) -> List[Path]:
    """Recherche tous les fichiers .log correspondant au mois et à l'année donnés."""
    month_name = FRENCH_MONTHS[month] if 1 <= month <= 12 else str(month)
    month_str_num = f"{month:02d}"
    year_str = str(year)
    
    found = []
    for p in logs_dir.glob("*.log"):
        fname = p.name.lower()
        # Ne pas archiver portfolio.log générique live
        if fname == "portfolio.log":
            continue
        # Correspondance par nom de mois ou numéro de mois et année
        if (month_name in fname or f"-{month_str_num}-" in fname or f".{month_str_num}." in fname) and year_str in fname:
            found.append(p)
    return sorted(found)

def create_monthly_archive(
    year: int,
    month: int,
    logs_dir: Optional[Path] = None,
    archives_dir: Optional[Path] = None,
    delete_archived: bool = True
) -> Dict[str, Any]:
    """
    Crée une archive compressée .tar.gz pour l'ensemble des logs d'un mois.
    Archive stockée dans le dossier archives/ sous le nom logs-mois.annee.tar.gz
    """
    l_dir = logs_dir or get_logs_directory()
    a_dir = archives_dir or get_archives_directory()
    
    archive_name = get_monthly_archive_filename(year, month)
    archive_path = a_dir / archive_name

    matching_logs = find_logs_for_month(l_dir, year, month)
    
    if not matching_logs:
        log_warning("log_manager.py", "create_monthly_archive", f"Aucun fichier de log trouvé pour {month}/{year} dans {l_dir}")
        return {
            "status": "empty",
            "message": f"Aucun log trouvé pour {month}/{year}",
            "archive_path": None,
            "files_count": 0
        }

    try:
        # Création de l'archive tar.gz
        with tarfile.open(archive_path, "w:gz") as tar:
            for log_file in matching_logs:
                tar.add(log_file, arcname=log_file.name)

        # Vérification de l'intégrité de l'archive
        if not tarfile.is_tarfile(archive_path):
            raise IOError("L'archive générée est invalide ou corrompue.")

        archive_size = archive_path.stat().st_size

        # Suppression des logs journaliers archivés si demandé
        deleted_count = 0
        if delete_archived:
            for log_file in matching_logs:
                try:
                    log_file.unlink()
                    deleted_count += 1
                except Exception as del_err:
                    log_warning("log_manager.py", "create_monthly_archive", f"Impossible de supprimer {log_file.name}: {del_err}")

        log_success(
            "log_manager.py",
            "create_monthly_archive",
            f"Archive mensuelle créée avec succès : {archive_name} ({len(matching_logs)} fichiers archivés, {archive_size} octets)"
        )

        return {
            "status": "ok",
            "archive_path": str(archive_path),
            "archive_name": archive_name,
            "files_count": len(matching_logs),
            "archive_size_bytes": archive_size,
            "deleted_count": deleted_count
        }
    except Exception as e:
        log_error("log_manager.py", "create_monthly_archive", f"Erreur lors de la création de l'archive {archive_name}: {str(e)}")
        raise e

def archive_previous_month(
    logs_dir: Optional[Path] = None,
    archives_dir: Optional[Path] = None
) -> Dict[str, Any]:
    """Calcule et archive automatiquement le mois précédent écoulé."""
    now = datetime.now()
    if now.month == 1:
        prev_month = 12
        prev_year = now.year - 1
    else:
        prev_month = now.month - 1
        prev_year = now.year
    
    return create_monthly_archive(prev_year, prev_month, logs_dir, archives_dir)

def list_logs_and_archives(
    logs_dir: Optional[Path] = None,
    archives_dir: Optional[Path] = None
) -> Dict[str, Any]:
    """Retourne la liste des logs quotidiens actuels et des archives mensuelles."""
    l_dir = logs_dir or get_logs_directory()
    a_dir = archives_dir or get_archives_directory()

    daily_logs = [
        {"name": p.name, "size": p.stat().st_size, "modified": datetime.fromtimestamp(p.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")}
        for p in l_dir.glob("*.log")
    ]
    archives = [
        {"name": p.name, "size": p.stat().st_size, "modified": datetime.fromtimestamp(p.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")}
        for p in a_dir.glob("*.tar.gz")
    ]

    return {
        "logs_directory": str(l_dir),
        "archives_directory": str(a_dir),
        "daily_logs": daily_logs,
        "archives": archives,
        "total_daily_logs": len(daily_logs),
        "total_archives": len(archives)
    }

def main():
    parser = argparse.ArgumentParser(description="Gestionnaire de logs et archivage mensuel tar.gz")
    parser.add_argument("--archive-previous", action="store_true", help="Archiver automatiquement le mois précédent")
    parser.add_argument("--archive-month", type=int, help="Numéro du mois à archiver (1-12)")
    parser.add_argument("--year", type=int, default=datetime.now().year, help="Année du mois à archiver")
    parser.add_argument("--status", action="store_true", help="Afficher les logs quotidiens et les archives existantes")
    parser.add_argument("--daily-name", action="store_true", help="Afficher le nom du fichier de log du jour")

    args = parser.parse_args()

    if args.daily_name:
        print(get_daily_log_filename())
        return

    if args.status:
        st = list_logs_and_archives()
        print(f"📁 Dossier logs     : {st['logs_directory']} ({st['total_daily_logs']} fichiers)")
        for log in st['daily_logs']:
            print(f"   - {log['name']} ({log['size']} octets)")
        print(f"📦 Dossier archives : {st['archives_directory']} ({st['total_archives']} archives tar.gz)")
        for arc in st['archives']:
            print(f"   - {arc['name']} ({arc['size']} octets)")
        return

    if args.archive_previous:
        res = archive_previous_month()
        print(res)
        return

    if args.archive_month:
        res = create_monthly_archive(args.year, args.archive_month)
        print(res)
        return

    parser.print_help()

if __name__ == "__main__":
    main()
