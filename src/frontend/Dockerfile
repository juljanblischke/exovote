# ---- Dependencies ----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM node:22-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV INTERNAL_API_URL=http://backend:5000

RUN pnpm build

# ---- Development ----
FROM node:22-alpine AS dev
RUN corepack enable pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

EXPOSE 3000
CMD ["pnpm", "dev"]

# ---- Production ----
FROM node:22-alpine AS production
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
