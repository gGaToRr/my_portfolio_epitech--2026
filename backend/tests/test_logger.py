import logging
import tempfile
import os
from pathlib import Path
from app.logger import (
    PortfolioLogFormatter,
    setup_logger,
    log_success,
    log_error,
    log_warning,
    log_interaction,
    COLOR_RED,
    COLOR_GREEN,
    COLOR_RESET,
)

def test_formatter_green_for_info():
    formatter = PortfolioLogFormatter(use_color=True)
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="app/test_file.py",
        lineno=10,
        msg="Opération réussie",
        args=(),
        exc_info=None,
        func="test_function"
    )
    formatted = formatter.format(record)
    assert formatted.startswith(COLOR_GREEN)
    assert formatted.endswith(COLOR_RESET)
    assert "[test_file.py](test_function)-----Opération réussie" in formatted

def test_formatter_red_for_error():
    formatter = PortfolioLogFormatter(use_color=True)
    record = logging.LogRecord(
        name="test",
        level=logging.ERROR,
        pathname="app/auth.py",
        lineno=20,
        msg="Mot de passe incorrect",
        args=(),
        exc_info=None,
        func="login_admin"
    )
    formatted = formatter.format(record)
    assert formatted.startswith(COLOR_RED)
    assert formatted.endswith(COLOR_RESET)
    assert "[auth.py](login_admin)-----Mot de passe incorrect" in formatted

def test_formatter_without_color():
    formatter = PortfolioLogFormatter(use_color=False)
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="app/projects.py",
        lineno=30,
        msg="Liste récupérée",
        args=(),
        exc_info=None,
        func="list_projects"
    )
    formatted = formatter.format(record)
    assert formatted == "[projects.py](list_projects)-----Liste récupérée"
    assert COLOR_GREEN not in formatted

def test_formatter_custom_attributes():
    formatter = PortfolioLogFormatter(use_color=True)
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="app/unknown.py",
        lineno=1,
        msg="Action client",
        args=(),
        exc_info=None,
        func="unknown"
    )
    record.custom_filename = "Projects.js"
    record.custom_func = "onClick"
    record.is_error = False
    
    formatted = formatter.format(record)
    assert "[Projects.js](onClick)-----Action client" in formatted

def test_setup_logger_writes_to_log_file():
    with tempfile.TemporaryDirectory() as tmpdir:
        log_file = Path(tmpdir) / "test_run.log"
        test_log = setup_logger("test_temp_logger", log_file=str(log_file), use_color=True)
        
        extra = {"custom_filename": "main.py", "custom_func": "root", "is_error": False}
        test_log.info("Test écriture fichier", extra=extra)
        
        # Flush
        for handler in test_log.handlers:
            handler.flush()
        
        assert log_file.exists()
        content = log_file.read_text(encoding="utf-8")
        assert "[main.py](root)-----Test écriture fichier" in content

def test_helper_log_success():
    res = log_success("test.py", "func_success", "Tout est OK")
    assert res == "[test.py](func_success)-----Tout est OK"

def test_helper_log_error():
    res = log_error("test.py", "func_error", "Échec critique")
    assert res == "[test.py](func_error)-----Échec critique"

def test_helper_log_warning():
    res = log_warning("test.py", "func_warn", "Attention danger")
    assert res == "[test.py](func_warn)-----Attention danger"

def test_helper_log_interaction():
    res_ok = log_interaction("ThemeToggle.js", "onToggle", "Mode sombre activé", is_error=False)
    assert res_ok == "[ThemeToggle.js](onToggle)-----Mode sombre activé"
    
    res_err = log_interaction("Contact.js", "onSubmit", "Échec envoi", is_error=True)
    assert res_err == "[Contact.js](onSubmit)-----Échec envoi"
