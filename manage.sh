#!/usr/bin/env bash
# Portfolio All-in-One CLI Manager

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMAND="${1:-status}"

case "$COMMAND" in
    start)
        "$ROOT_DIR/start.sh"
        ;;
    stop|down)
        "$ROOT_DIR/down.sh"
        ;;
    restart)
        "$ROOT_DIR/restart.sh"
        ;;
    status)
        "$ROOT_DIR/status.sh"
        ;;
    logs)
        LOG_FILE="$ROOT_DIR/backend/logs/portfolio.log"
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "Aucun fichier de log trouvé."
        fi
        ;;
    test)
        echo "Exécution des tests backend..."
        PYTHONPATH="$ROOT_DIR/backend" "$ROOT_DIR/backend/venv/bin/pytest" "$ROOT_DIR/backend/tests/" -v
        ;;
    *)
        echo "Usage: ./manage.sh {start|stop|down|restart|status|logs|test}"
        exit 1
        ;;
esac
