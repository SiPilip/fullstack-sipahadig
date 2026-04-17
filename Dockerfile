FROM node:20-alpine AS base

# 1. Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy package and prisma definition
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
# Install all dependencies
RUN npm ci

# 2. Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set to disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
RUN npm run build

# 3. Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma needs openssl
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct cache permission
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Make a dedicated directory for sqlite database volume
RUN mkdir -p /app/prisma/data && chown -R nextjs:nodejs /app/prisma

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# Note: Any prisma db push or migrate must be done before this, or provide pre-populated sqlite db
CMD ["node", "server.js"]
