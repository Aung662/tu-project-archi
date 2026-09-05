# ─────────────────────────────────────────────────────────────
# TU Archive backend — multi-stage production image.
# Build:  docker build -t tu-archive-api ./backend
# Run:    docker run -p 4000:4000 --env-file backend/.env tu-archive-api
# ─────────────────────────────────────────────────────────────

# 1) Builder — install all deps, generate Prisma client, compile TS → dist/
FROM node:20-slim AS builder
WORKDIR /app
# OpenSSL is required by Prisma engines on slim images
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
ENV DB_PROVIDER=postgresql
RUN npm run build

# 2) Runtime — copy only what's needed, install prod deps only
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
# Compiled app + Prisma schema/generated client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# Persist uploaded files on a mounted volume in production
RUN mkdir -p storage/private storage/public
VOLUME ["/app/storage"]
EXPOSE 4000
# Non-root for safety
USER node
CMD ["node", "dist/server.js"]
