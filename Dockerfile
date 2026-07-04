# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_QUERY_GC_TIME=0
ARG NEXT_PUBLIC_QUERY_STALE_TIME=0
ARG NEXT_PUBLIC_QUERY_RETRY=false

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_QUERY_GC_TIME=$NEXT_PUBLIC_QUERY_GC_TIME \
    NEXT_PUBLIC_QUERY_STALE_TIME=$NEXT_PUBLIC_QUERY_STALE_TIME \
    NEXT_PUBLIC_QUERY_RETRY=$NEXT_PUBLIC_QUERY_RETRY

RUN npm run build

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
