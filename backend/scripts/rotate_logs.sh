#!/usr/bin/env bash
# ==============================================================================
# Script de gestion des logs quotidiens et archivage mensuel (.tar.gz)
# Usage:
#   ./rotate_logs.sh --daily     # Initialise ou vérifie le fichier du jour
#   ./rotate_logs.sh --archive   # Archive le mois écoulé en tar.gz
#   ./rotate_logs.sh --status    # Affiche le statut des logs et archives
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Détection de l'environnement virtuel Python
if [ -f "$BACKEND_DIR/venv/bin/python" ]; then
    PYTHON_BIN="$BACKEND_DIR/venv/bin/python"
else
    PYTHON_BIN="python3"
fi

export PYTHONPATH="$BACKEND_DIR"

case "$1" in
    --daily)
        TODAY_LOG=$("$PYTHON_BIN" -m scripts.log_manager --daily-name)
        LOGS_DIR="$BACKEND_DIR/logs"
        mkdir -p "$LOGS_DIR"
        touch "$LOGS_DIR/$TODAY_LOG"
        echo "[INFO] Fichier de log du jour : $LOGS_DIR/$TODAY_LOG"
        ;;
    --archive)
        echo "[INFO] Archivage mensuel en cours..."
        "$PYTHON_BIN" -m scripts.log_manager --archive-previous
        ;;
    --status)
        "$PYTHON_BIN" -m scripts.log_manager --status
        ;;
    *)
        echo "Usage: $0 {--daily|--archive|--status}"
        exit 1
        ;;
esac
