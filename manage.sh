#!/usr/bin/env bash
# ==============================================================================
# Portfolio Pierre Untersinger - Gestionnaire Unifié (CLI & Services)
# ==============================================================================
# Usage :
#   ./manage.sh start         -> Démarrer Backend FastAPI & Frontend React
#   ./manage.sh stop          -> Arrêter tous les services proprement
#   ./manage.sh restart       -> Redémarrer l'ensemble des services
#   ./manage.sh status        -> Afficher l'état de santé, l'uptime et les sondes
#   ./manage.sh logs          -> Suivre les logs en temps réel (tail -f)
#   ./manage.sh test          -> Exécuter la suite complète de tests unitaires
#   ./manage.sh archive-logs  -> Compresser & archiver les logs du mois en .tar.gz
#   ./manage.sh smtp          -> Diagnostic et configuration SMTP interactive
#   ./manage.sh (sans args)   -> Menu interactif complet
# ==============================================================================

set -e

# Couleurs et formatage
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$ROOT_DIR/backend/logs"
ARCHIVES_DIR="$LOGS_DIR/archives"
mkdir -p "$LOGS_DIR" "$ARCHIVES_DIR"

show_banner() {
    echo -e "${CYAN}${BOLD}"
    echo "  ╔════════════════════════════════════════════════════════════╗"
    echo "  ║         PORTFOLIO PIERRE UNTERSINGER - GESTIONNAIRE        ║"
    echo "  ╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 0. NETTOYAGE DES TRACES & CACHES
cleanup_traces() {
    echo -e "${CYAN}🧹 Nettoyage des traces temporaires et caches...${NC}"
    find "$ROOT_DIR/backend" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find "$ROOT_DIR/backend" -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
    find "$ROOT_DIR" -type f -name "*.pyc" -delete 2>/dev/null || true
    find "$ROOT_DIR" -type f -name ".DS_Store" -delete 2>/dev/null || true
    rm -rf "$ROOT_DIR/.pids" 2>/dev/null || true
    echo -e "${GREEN}✓ Traces et caches nettoyés.${NC}"
}

# 1. DÉMARRAGE DES SERVICES
service_start() {
    echo -e "${CYAN}===================================================${NC}"
    echo -e "${CYAN}🚀 Démarrage du Portfolio (Backend FastAPI + Frontend React)${NC}"
    echo -e "${CYAN}===================================================${NC}"

    # 1.1 Backend FastAPI
    if lsof -i:5001 -sTCP:LISTEN >/dev/null 2>&1; then
        BACKEND_PID=$(lsof -ti:5001 | head -n1)
        echo -e "${YELLOW}⚠️  Backend déjà en cours d'exécution sur le port 5001 (PID $BACKEND_PID)${NC}"
    else
        echo -e "${CYAN}▶ Démarrage du Backend FastAPI (Port 5001)...${NC}"
        cd "$ROOT_DIR/backend"
        if [ -f "venv/bin/python" ]; then
            setsid venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 5001 > "$LOGS_DIR/portfolio.log" 2>&1 &
            BACKEND_PID=$!
            echo -e "${GREEN}✓ Backend FastAPI démarré (PID $BACKEND_PID)${NC}"
        else
            echo -e "${RED}❌ venv introuvable dans backend/venv. Initialisation requise.${NC}"
        fi
    fi

    # 1.2 Frontend React
    if lsof -i:3006 -sTCP:LISTEN >/dev/null 2>&1; then
        FRONTEND_PID=$(lsof -ti:3006 | head -n1)
        echo -e "${YELLOW}⚠️  Frontend déjà en cours d'exécution sur le port 3006 (PID $FRONTEND_PID)${NC}"
    else
        echo -e "${CYAN}▶ Démarrage du Frontend React (Port 3006)...${NC}"
        cd "$ROOT_DIR/portfolio-v1.2.0/portfo"
        PORT=3006 BROWSER=none setsid npm start > "$LOGS_DIR/frontend.log" 2>&1 &
        FRONTEND_PID=$!
        echo -e "${GREEN}✓ Frontend React démarré (PID $FRONTEND_PID)${NC}"
    fi

    cd "$ROOT_DIR"
    echo ""
    echo -e "${GREEN}✨ Tous les services sont opérationnels !${NC}"
    echo -e "   • Frontend : ${CYAN}http://localhost:3006${NC}"
    echo -e "   • Panel Admin : ${CYAN}http://localhost:3006/panelAdmin${NC}"
    echo -e "   • Backend API : ${CYAN}http://localhost:5001${NC}"
    echo -e "   • Swagger UI : ${CYAN}http://localhost:5001/docs${NC}"
    echo -e "   • Uptime & Status : ${CYAN}http://localhost:5001/status${NC}"
    echo -e "${CYAN}===================================================${NC}"
}

# 2. ARRÊT DES SERVICES
service_stop() {
    echo -e "${CYAN}===================================================${NC}"
    echo -e "${CYAN}🛑 Arrêt des services Portfolio${NC}"
    echo -e "${CYAN}===================================================${NC}"

    # Arrêt Backend
    if lsof -i:5001 -sTCP:LISTEN >/dev/null 2>&1; then
        BACKEND_PIDS=$(lsof -ti:5001)
        echo -e "${YELLOW}Arrêt du Backend sur le port 5001 (PID $BACKEND_PIDS)...${NC}"
        kill $BACKEND_PIDS 2>/dev/null || true
        sleep 1
        lsof -ti:5001 | xargs -r kill -9 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ Backend arrêté.${NC}"

    # Arrêt Frontend
    if lsof -i:3006 -sTCP:LISTEN >/dev/null 2>&1; then
        FRONTEND_PIDS=$(lsof -ti:3006)
        echo -e "${YELLOW}Arrêt du Frontend sur le port 3006 (PID $FRONTEND_PIDS)...${NC}"
        kill $FRONTEND_PIDS 2>/dev/null || true
        sleep 1
        lsof -ti:3006 | xargs -r kill -9 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ Frontend arrêté.${NC}"

    echo -e "${GREEN}✓ Tous les services sont arrêtés et les ports libérés.${NC}"
    cleanup_traces
    echo -e "${CYAN}===================================================${NC}"
}

# 3. REDÉMARRAGE
service_restart() {
    service_stop
    sleep 1
    service_start
}

# 4. STATUT & SONDES
service_status() {
    echo -e "${CYAN}===================================================${NC}"
    echo -e "${CYAN}📊 Statut des Services Portfolio${NC}"
    echo -e "${CYAN}===================================================${NC}"

    # Backend
    BACKEND_STATUS="${RED}INACTIF${NC}"
    if lsof -i:5001 -sTCP:LISTEN >/dev/null 2>&1; then
        BACKEND_PID=$(lsof -ti:5001 | head -n1)
        BACKEND_STATUS="${GREEN}ACTIF sur port 5001 (PID $BACKEND_PID)${NC}"
    fi

    # Frontend
    FRONTEND_STATUS="${RED}INACTIF${NC}"
    if lsof -i:3006 -sTCP:LISTEN >/dev/null 2>&1; then
        FRONTEND_PID=$(lsof -ti:3006 | head -n1)
        FRONTEND_STATUS="${GREEN}ACTIF sur port 3006 (PID $FRONTEND_PID)${NC}"
    fi

    echo -e " • Backend FastAPI (Port 5001) : $BACKEND_STATUS"
    echo -e " • Frontend React  (Port 3006) : $FRONTEND_STATUS"
    echo ""

    # Sonde API
    if curl -s -f http://localhost:5001/status >/dev/null 2>&1; then
        STATUS_JSON=$(curl -s http://localhost:5001/status)
        HEALTH=$(echo "$STATUS_JSON" | grep -o '"status":"[^"]*' | head -n1 | cut -d'"' -f4)
        UPTIME=$(echo "$STATUS_JSON" | grep -o '"uptime_human":"[^"]*' | cut -d'"' -f4)
        REQ_COUNT=$(echo "$STATUS_JSON" | grep -o '"total_requests":[0-9]*' | cut -d':' -f2)
        SUCCESS_RATE=$(echo "$STATUS_JSON" | grep -o '"success_rate":"[^"]*' | cut -d'"' -f4)
        DB_STATUS=$(echo "$STATUS_JSON" | grep -o '"status":"[^"]*' | sed -n '2p' | cut -d'"' -f4)
        DB_LATENCY=$(echo "$STATUS_JSON" | grep -o '"latency_ms":[0-9.]*' | cut -d':' -f2)

        echo -e "${GREEN}🔍 Sonde API /status : Opérationnelle${NC}"
        echo -e "   • Santé globale       : ${GREEN}$HEALTH${NC}"
        echo -e "   • Uptime              : $UPTIME"
        echo -e "   • Requêtes servies    : $REQ_COUNT (Taux succès: $SUCCESS_RATE)"
        echo -e "   • Base SQLite         : $DB_STATUS (${DB_LATENCY} ms)"
    else
        echo -e "${YELLOW}🔍 Sonde API /status : Injoignable (Serveur éteint ou port différent)${NC}"
    fi

    # Sonde Frontend
    if curl -s -f http://localhost:3006 >/dev/null 2>&1; then
        echo -e "${GREEN}🌐 Sonde Frontend UI   : Accessible sur http://localhost:3006${NC}"
    else
        echo -e "${YELLOW}🌐 Sonde Frontend UI   : En attente ou compilation en cours...${NC}"
    fi

    echo -e "${CYAN}===================================================${NC}"
}

# 5. SUIVI DES LOGS
service_logs() {
    LOG_FILE="$LOGS_DIR/portfolio.log"
    echo -e "${CYAN}📄 Suivi des logs Backend en direct (${LOG_FILE})... (Ctrl+C pour quitter)${NC}"
    if [ ! -f "$LOG_FILE" ]; then
        touch "$LOG_FILE"
    fi
    tail -f "$LOG_FILE"
}

service_logs_front() {
    LOG_FILE="$LOGS_DIR/frontend.log"
    echo -e "${CYAN}📄 Suivi des logs Frontend en direct (${LOG_FILE})... (Ctrl+C pour quitter)${NC}"
    if [ ! -f "$LOG_FILE" ]; then
        touch "$LOG_FILE"
    fi
    tail -f "$LOG_FILE"
}

# 6. TESTS UNITAIRES
service_test() {
    echo -e "${CYAN}🧪 Exécution de la suite complète de tests unitaires & intégration...${NC}"
    cd "$ROOT_DIR"
    PYTHONPATH="$ROOT_DIR/backend" "$ROOT_DIR/backend/venv/bin/pytest" "$ROOT_DIR/backend/tests/" -v
    cleanup_traces
}

# 7. ARCHIVAGE MENSUEL DES LOGS
service_archive_logs() {
    echo -e "${CYAN}📦 Archivage mensuel des logs quotidiens en .tar.gz...${NC}"
    cd "$ROOT_DIR"
    PYTHONPATH="$ROOT_DIR/backend" "$ROOT_DIR/backend/venv/bin/python" "$ROOT_DIR/backend/scripts/log_manager.py" --archive-prev
    echo -e "${GREEN}✓ Opération d'archivage terminée.${NC}"
}

# 8. DIAGNOSTIC SMTP
service_smtp() {
    echo -e "${CYAN}===================================================${NC}"
    echo -e "${CYAN}📧 Diagnostic et Configuration SMTP${NC}"
    echo -e "${CYAN}===================================================${NC}"

    if curl -s -f http://localhost:5001/api/health >/dev/null 2>&1; then
        HEALTH_RES=$(curl -s http://localhost:5001/api/health)
        echo -e " • Endpoint Healthcheck API : ${GREEN}En ligne${NC}"
        echo -e " • Configuration détectée   : $HEALTH_RES"
    else
        echo -e " • Endpoint Healthcheck API : ${YELLOW}Backend éteint (démarrez le backend avec ./manage.sh start)${NC}"
    fi
    echo -e "${CYAN}===================================================${NC}"
}

# MENU INTERACTIF
interactive_menu() {
    show_banner
    echo -e "Sélectionnez une action :"
    echo -e "  ${BOLD}1)${NC} ${GREEN}🚀 Démarrer les services${NC} (start)"
    echo -e "  ${BOLD}2)${NC} ${RED}🛑 Arrêter les services${NC} (stop / down)"
    echo -e "  ${BOLD}3)${NC} ${YELLOW}🔄 Redémarrer les services${NC} (restart)"
    echo -e "  ${BOLD}4)${NC} ${CYAN}📊 Statut & Sondes de santé${NC} (status)"
    echo -e "  ${BOLD}5)${NC} ${BLUE}📄 Suivre les logs Backend${NC} (logs)"
    echo -e "  ${BOLD}6)${NC} ${BLUE}📄 Suivre les logs Frontend${NC} (logs-front)"
    echo -e "  ${BOLD}7)${NC} ${MAGENTA}🧪 Lancer les tests pytest${NC} (test)"
    echo -e "  ${BOLD}8)${NC} ${CYAN}🧹 Nettoyer caches & traces${NC} (clean)"
    echo -e "  ${BOLD}9)${NC} ${CYAN}📦 Archiver les logs mensuels (.tar.gz)${NC} (archive-logs)"
    echo -e "  ${BOLD}10)${NC} ${YELLOW}📧 Diagnostic SMTP${NC} (smtp)"
    echo -e "  ${BOLD}q)${NC} Quitter"
    echo ""
    read -rp "Choix [1-10/q] : " choice

    case "$choice" in
        1) service_start ;;
        2) service_stop ;;
        3) service_restart ;;
        4) service_status ;;
        5) service_logs ;;
        6) service_logs_front ;;
        7) service_test ;;
        8) cleanup_traces ;;
        9) service_archive_logs ;;
        10) service_smtp ;;
        q|Q) echo "Sortie."; exit 0 ;;
        *) echo -e "${RED}Option invalide.${NC}"; exit 1 ;;
    esac
}

# ROUTEUR D'ARGUMENTS CLI
COMMAND="${1:-}"

case "$COMMAND" in
    start)
        service_start
        ;;
    stop|down)
        service_stop
        ;;
    restart)
        service_restart
        ;;
    status)
        service_status
        ;;
    logs)
        service_logs
        ;;
    logs-front)
        service_logs_front
        ;;
    test)
        service_test
        ;;
    clean)
        cleanup_traces
        ;;
    archive-logs|rotate-logs)
        service_archive_logs
        ;;
    smtp)
        service_smtp
        ;;
    help|--help|-h)
        show_banner
        echo "Usage: ./manage.sh [start|stop|restart|status|logs|logs-front|test|clean|archive-logs|smtp]"
        ;;
    "")
        interactive_menu
        ;;
    *)
        echo -e "${RED}Commande inconnue : '$COMMAND'${NC}"
        echo "Usage: ./manage.sh [start|stop|restart|status|logs|logs-front|test|clean|archive-logs|smtp]"
        exit 1
        ;;
esac
