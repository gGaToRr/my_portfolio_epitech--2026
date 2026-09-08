# Multi-stage build — ultra-léger et sécurisé
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=5001

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/build ./build
COPY server.js .

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5001/api/health || exit 1

USER node
CMD ["node", "server.js"]
