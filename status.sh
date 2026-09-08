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
echo -e "${CYAN}📊 Statut des Services Portfolio${NC}"
echo -e "${CYAN}===================================================${NC}"

# Check Backend
BACKEND_STATUS="${RED}INACTIF${NC}"
if [ -f "$PID_DIR/backend.pid" ] && kill -0 "$(cat "$PID_DIR/backend.pid")" 2>/dev/null; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    BACKEND_STATUS="${GREEN}ACTIF (PID $BACKEND_PID)${NC}"
elif lsof -i:5001 -sTCP:LISTEN >/dev/null 2>&1; then
    BACKEND_PID=$(lsof -ti:5001 | head -n1)
    BACKEND_STATUS="${GREEN}ACTIF sur port 5001 (PID $BACKEND_PID)${NC}"
fi

# Check Frontend
FRONTEND_STATUS="${RED}INACTIF${NC}"
if [ -f "$PID_DIR/frontend.pid" ] && kill -0 "$(cat "$PID_DIR/frontend.pid")" 2>/dev/null; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    FRONTEND_STATUS="${GREEN}ACTIF (PID $FRONTEND_PID)${NC}"
elif lsof -i:3006 -sTCP:LISTEN >/dev/null 2>&1; then
    FRONTEND_PID=$(lsof -ti:3006 | head -n1)
    FRONTEND_STATUS="${GREEN}ACTIF sur port 3006 (PID $FRONTEND_PID)${NC}"
fi

echo -e " • Backend FastAPI (Port 5001) : $BACKEND_STATUS"
echo -e " • Frontend React  (Port 3006) : $FRONTEND_STATUS"
echo ""

# Probe live API status
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

# Probe live Frontend
if curl -s -f http://localhost:3006 >/dev/null 2>&1; then
    echo -e "${GREEN}🌐 Sonde Frontend UI   : Accessible sur http://localhost:3006${NC}"
else
    echo -e "${YELLOW}🌐 Sonde Frontend UI   : En attente ou compilation en cours...${NC}"
fi

echo -e "${CYAN}===================================================${NC}"
