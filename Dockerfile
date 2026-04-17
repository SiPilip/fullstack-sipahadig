# Dockerfile ini telah diubah untuk HANYA mengambil hasil build dari lokal
# Ini sepenuhnya menghindari masalah koneksi npm di dalam Docker

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install openssl for Prisma
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct cache permission
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Make a dedicated directory for sqlite database volume
RUN mkdir -p /app/prisma/data && chown -R nextjs:nodejs /app/prisma

# COPY dari build lokal Anda langsung ke Docker
COPY --chown=nextjs:nodejs public ./public
# Copy hasil prisma yang sudah digenerate juga untuk linux
COPY --chown=nextjs:nodejs prisma ./prisma

# Copy the standalone build (dari lokal)
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
