# Install dependencies 
FROM node:20-alpine AS dep 

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --filter api --frozen-lockfile

# Build 
FROM deps AS builder

WORKDIR /app

COPY apps/api ./apps/api

RUN cd apps/api && npx prisma generate && pnpm build

# Production runner 
FROM node:20-alpine AS runner
RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

RUN pnpm install --filter api --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN cd apps/api && npx prisma generate

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]