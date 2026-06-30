# Build from repo root: docker compose -f docker-compose.sync-server.yml build
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/sync-server/package.json apps/sync-server/
COPY packages/sync/package.json packages/sync/
COPY packages/schemas/package.json packages/schemas/
COPY packages/config/package.json packages/config/

RUN npm ci --workspace=@codex/sync-server --include-workspace-root

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=1999
ENV HOST=0.0.0.0

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/sync-server ./apps/sync-server
COPY packages/sync ./packages/sync
COPY packages/schemas ./packages/schemas
COPY packages/config ./packages/config

EXPOSE 1999

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:1999/health || exit 1

CMD ["npm", "run", "start", "--workspace=@codex/sync-server"]
