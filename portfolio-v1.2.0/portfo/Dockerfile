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

USER node
CMD ["node", "server.js"]
