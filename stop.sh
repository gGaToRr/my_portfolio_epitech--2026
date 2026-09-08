#!/usr/bin/env bash
# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT_DIR/.pids"

echo -e "${CYAN}===================================================${NC}"
echo -e "${CYAN}🛑 Arrêt des services Portfolio${NC}"
echo -e "${CYAN}===================================================${NC}"

# 1. Stop Backend
if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo -e "${YELLOW}Arrêt du Backend (PID $BACKEND_PID)...${NC}"
        kill "$BACKEND_PID" 2>/dev/null || true
        sleep 1
        kill -9 "$BACKEND_PID" 2>/dev/null || true
        echo -e "${GREEN}✓ Backend arrêté.${NC}"
    fi
    rm -f "$PID_DIR/backend.pid"
fi

# Fallback kill any uvicorn on port 5001
lsof -ti:5001 | xargs -r kill -9 2>/dev/null || true

# 2. Stop Frontend
if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        echo -e "${YELLOW}Arrêt du Frontend (PID $FRONTEND_PID)...${NC}"
        kill -- -"$FRONTEND_PID" 2>/dev/null || kill "$FRONTEND_PID" 2>/dev/null || true
        sleep 1
        kill -9 "$FRONTEND_PID" 2>/dev/null || true
        echo -e "${GREEN}✓ Frontend arrêté.${NC}"
    fi
    rm -f "$PID_DIR/frontend.pid"
fi

# Fallback kill any process on port 3006
lsof -ti:3006 | xargs -r kill -9 2>/dev/null || true

echo -e "${GREEN}✓ Tous les services sont arrêtés.${NC}"
echo -e "${CYAN}===================================================${NC}"
