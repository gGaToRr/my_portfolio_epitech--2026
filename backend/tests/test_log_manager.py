import tarfile
import tempfile
from datetime import datetime
from pathlib import Path
from app.logger import get_daily_log_filename, get_monthly_archive_filename
from scripts.log_manager import (
    find_logs_for_month,
    create_monthly_archive,
    archive_previous_month,
    list_logs_and_archives,
)

def test_daily_log_filename_known_dates():
    # Mercredi 9 septembre 2026
    dt1 = datetime(2026, 9, 9, 14, 30)
    assert get_daily_log_filename(dt1) == "mercredi-09-septembre.2026.log"

    # Jeudi 1er janvier 2026
    dt2 = datetime(2026, 1, 1, 0, 0)
    assert get_daily_log_filename(dt2) == "jeudi-01-janvier.2026.log"

    # Lundi 7 septembre 2026
    dt3 = datetime(2026, 9, 7, 8, 15)
    assert get_daily_log_filename(dt3) == "lundi-07-septembre.2026.log"

    # Mardi 14 juillet 2026
    dt4 = datetime(2026, 7, 14, 20, 0)
    assert get_daily_log_filename(dt4) == "mardi-14-juillet.2026.log"

def test_monthly_archive_filename():
    assert get_monthly_archive_filename(2026, 9) == "logs-septembre.2026.tar.gz"
    assert get_monthly_archive_filename(2026, 8) == "logs-aout.2026.tar.gz"
    assert get_monthly_archive_filename(2026, 12) == "logs-decembre.2026.tar.gz"

def test_create_monthly_archive_tar_gz():
    with tempfile.TemporaryDirectory() as tmp_logs, tempfile.TemporaryDirectory() as tmp_archives:
        logs_dir = Path(tmp_logs)
        archives_dir = Path(tmp_archives)

        # Créer des logs factices pour le mois d'août 2026
        log1 = logs_dir / "samedi-01-aout.2026.log"
        log2 = logs_dir / "dimanche-02-aout.2026.log"
        log3 = logs_dir / "lundi-03-aout.2026.log"
        
        # Log d'un autre mois (septembre) qui ne doit PAS être archivé
        other_log = logs_dir / "mercredi-09-septembre.2026.log"

        log1.write_text("[2026-08-01 10:00:00][main.py](root)-----Log Aout 1\n", encoding="utf-8")
        log2.write_text("[2026-08-02 11:00:00][main.py](root)-----Log Aout 2\n", encoding="utf-8")
        log3.write_text("[2026-08-03 12:00:00][main.py](root)-----Log Aout 3\n", encoding="utf-8")
        other_log.write_text("[2026-09-09 12:00:00][main.py](root)-----Log Septembre\n", encoding="utf-8")

        # Exécuter l'archivage pour août 2026
        result = create_monthly_archive(
            year=2026,
            month=8,
            logs_dir=logs_dir,
            archives_dir=archives_dir,
            delete_archived=True
        )

        assert result["status"] == "ok"
        assert result["files_count"] == 3
        assert result["deleted_count"] == 3

        archive_file = archives_dir / "logs-aout.2026.tar.gz"
        assert archive_file.exists()
        assert tarfile.is_tarfile(archive_file)

        # Vérifier le contenu du tar.gz
        with tarfile.open(archive_file, "r:gz") as tar:
            names = tar.getnames()
            assert "samedi-01-aout.2026.log" in names
            assert "dimanche-02-aout.2026.log" in names
            assert "lundi-03-aout.2026.log" in names
            assert "mercredi-09-septembre.2026.log" not in names

        # Vérifier que les fichiers d'août ont été supprimés et que septembre reste
        assert not log1.exists()
        assert not log2.exists()
        assert not log3.exists()
        assert other_log.exists()

def test_create_monthly_archive_empty():
    with tempfile.TemporaryDirectory() as tmp_logs, tempfile.TemporaryDirectory() as tmp_archives:
        result = create_monthly_archive(
            year=2025,
            month=1,
            logs_dir=Path(tmp_logs),
            archives_dir=Path(tmp_archives)
        )
        assert result["status"] == "empty"
        assert result["files_count"] == 0

def test_list_logs_and_archives():
    with tempfile.TemporaryDirectory() as tmp_logs, tempfile.TemporaryDirectory() as tmp_archives:
        l_dir = Path(tmp_logs)
        a_dir = Path(tmp_archives)

        (l_dir / "mercredi-09-septembre.2026.log").write_text("Test", encoding="utf-8")
        (a_dir / "logs-aout.2026.tar.gz").write_text("Archive Mock", encoding="utf-8")

        st = list_logs_and_archives(logs_dir=l_dir, archives_dir=a_dir)
        assert st["total_daily_logs"] == 1
        assert st["total_archives"] == 1
        assert st["daily_logs"][0]["name"] == "mercredi-09-septembre.2026.log"
        assert st["archives"][0]["name"] == "logs-aout.2026.tar.gz"
