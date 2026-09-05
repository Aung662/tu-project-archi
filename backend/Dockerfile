# ─────────────────────────────────────────────────────────────
# TU Archive backend — production image.
# Works on any container platform (Koyeb, Fly, Render, Railway, …).
# Build:  docker build -t tu-archive-api ./backend
# Run:    docker run -p 4000:4000 --env-file backend/.env tu-archive-api
#
# On boot, docker-entrypoint.sh bootstraps a PostgreSQL database
# (tables + pg_trgm + seed) then starts the API. See that script.
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

# 2) Runtime — keep the full dependency set so the startup bootstrap can run
#    `prisma db push`, `tsx scripts/setup-postgres.ts`, and `tsx prisma/seed.ts`.
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
# Copy the built app + everything the entrypoint bootstrap needs.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
# Persist uploaded files on a mounted volume in production
RUN mkdir -p storage/private storage/public
VOLUME ["/app/storage"]
EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
