# ========================================================
# JIV FLEET PLATFORM - MULTI-STAGE PRODUCTION DOCKERFILE
# Optimised for Bare-Metal Self-Hosting & Cloud Registries
# ========================================================

# --- Stage 1: Build Phase ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package manifests and install dependencies
COPY package.json ./
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend static bundle + esbuild bundled ESM Express server
ENV NODE_ENV=production
RUN npm run build

# --- Stage 2: Production Execution Runtime ---
FROM node:22-alpine AS runner

WORKDIR /app

# Install curl for health check
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV APP_MODE=local

# Copy build artifacts and package manifest
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Install runtime production dependencies only
RUN npm install --omit=dev --ignore-scripts

# Create non-root system user for security isolation
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001 && \
    chown -R nodeapp:nodejs /app

USER nodeapp

EXPOSE 3000

# Container Healthcheck pinging Express API
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start compiled Express server
CMD ["node", "dist/server.mjs"]
