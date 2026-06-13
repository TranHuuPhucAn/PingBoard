# Build
FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json tsconfig.base.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

RUN pnpm install --filter api --frozen-lockfile

COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/

RUN cd apps/api && pnpm exec prisma generate && pnpm build

# Production runner
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json tsconfig.base.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

RUN pnpm install --filter api --frozen-lockfile

COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN cd apps/api && pnpm exec prisma generate

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["bash", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/index.js"]