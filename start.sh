#!/usr/bin/env bash
set -e

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT_DIR/.pids"
LOGS_DIR="$ROOT_DIR/backend/logs"
mkdir -p "$PID_DIR" "$LOGS_DIR"

echo -e "${CYAN}===================================================${NC}"
echo -e "${CYAN}🚀 Démarrage du Portfolio (Backend FastAPI + Frontend React)${NC}"
echo -e "${CYAN}===================================================${NC}"

# 1. Start Backend FastAPI
if lsof -i:5001 -sTCP:LISTEN >/dev/null 2>&1; then
    BACKEND_PID=$(lsof -ti:5001 | head -n1)
    echo $BACKEND_PID > "$PID_DIR/backend.pid"
    echo -e "${YELLOW}⚠️  Backend déjà en cours d'exécution (PID $BACKEND_PID)${NC}"
else
    echo -e "${CYAN}▶ Démarrage du Backend FastAPI (Port 5001)...${NC}"
    cd "$ROOT_DIR/backend"
    if [ -f "venv/bin/uvicorn" ]; then
        setsid venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 5001 > "$LOGS_DIR/portfolio.log" 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > "$PID_DIR/backend.pid"
        echo -e "${GREEN}✓ Backend FastAPI démarré (PID $BACKEND_PID)${NC}"
    else
        echo -e "${RED}❌ venv introuvable dans backend/venv. Initialisation requise.${NC}"
    fi
fi

# 2. Start Frontend React
if lsof -i:3006 -sTCP:LISTEN >/dev/null 2>&1; then
    FRONTEND_PID=$(lsof -ti:3006 | head -n1)
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
    echo -e "${YELLOW}⚠️  Frontend déjà en cours d'exécution (PID $FRONTEND_PID)${NC}"
else
    echo -e "${CYAN}▶ Démarrage du Frontend React (Port 3006)...${NC}"
    cd "$ROOT_DIR/portfolio-v1.2.0/portfo"
    PORT=3006 BROWSER=none setsid node ./node_modules/react-scripts/bin/react-scripts.js start > "$PID_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"
    echo -e "${GREEN}✓ Frontend React démarré (PID $FRONTEND_PID)${NC}"
fi

cd "$ROOT_DIR"
echo ""
echo -e "${GREEN}✨ Tous les services ont été lancés !${NC}"
echo -e "   • Frontend : ${CYAN}http://localhost:3006${NC}"
echo -e "   • Panel Admin : ${CYAN}http://localhost:3006/panelAdmin${NC}"
echo -e "   • Backend API : ${CYAN}http://localhost:5001${NC}"
echo -e "   • Swagger UI : ${CYAN}http://localhost:5001/docs${NC}"
echo -e "   • Uptime & Status : ${CYAN}http://localhost:5001/status${NC}"
echo -e "${CYAN}===================================================${NC}"
