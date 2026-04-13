# ─── Build stage ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
COPY tsconfig.build.json ./
RUN npx tsc -p tsconfig.build.json

# ─── Production stage ─────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force
RUN npx prisma generate

# Copy compiled code
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Run migrations on startup, then start server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
