FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---- Dependencias ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

# ---- Producción ----
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./

EXPOSE 3000
# Aplica las migraciones pendientes de la base de datos antes de arrancar (si fallan, el servidor arranca igual y lo deja en el log)
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy || echo '[migraciones] No se pudieron aplicar; revisa el log'; exec node dist/server.cjs"]