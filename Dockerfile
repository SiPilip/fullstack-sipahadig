# Stage 1: Generate Prisma client untuk Linux Alpine
FROM node:20-alpine AS prisma-gen
WORKDIR /app

RUN apk add --no-cache openssl

# Copy hanya file yang dibutuhkan untuk prisma generate
COPY prisma ./prisma/
COPY package.json ./

# Install HANYA prisma (ringan, cepat, ~30 detik)
RUN npm install prisma @prisma/client --no-optional --ignore-scripts \
    && npx prisma generate

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Dedicated directory for sqlite database volume
RUN mkdir -p /app/prisma/data && chown -R nextjs:nodejs /app/prisma

# Copy public assets
COPY --chown=nextjs:nodejs public ./public

# Copy prisma schema (untuk referensi runtime)
COPY --chown=nextjs:nodejs prisma/schema.prisma ./prisma/schema.prisma

# Copy standalone build dari lokal Windows
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

# TIMPA prisma client dari Windows dengan yang di-generate untuk Linux Alpine
COPY --from=prisma-gen --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma-gen --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
