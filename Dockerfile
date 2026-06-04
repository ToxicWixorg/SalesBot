# Build stage: Node.js for dependency installation
FROM node:20-slim AS builder
WORKDIR /build
COPY package.json bun.lock ./
RUN npm install --frozen-lockfile --omit=dev --no-optional

# Runtime stage: Bun
FROM oven/bun:1.1.38
WORKDIR /usr/src/app

# Copy node_modules from builder
COPY --from=builder /build/node_modules ./node_modules

# Copy application code
COPY package.json bun.lock tsconfig.json ./
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.ts ./

ENV NODE_ENV=production

ENTRYPOINT [ "bun", "start" ]
