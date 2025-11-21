# Component Registry Service Dockerfile
# Multi-stage build for optimal size and security

# ==================== Build Stage ====================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# ==================== Production Stage ====================
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S cms -u 1001

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache curl dumb-init

# Copy built application and dependencies
COPY --from=builder --chown=cms:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=cms:nodejs /app/dist ./dist
COPY --chown=cms:nodejs package*.json ./

# Create data directory
RUN mkdir -p /app/data && chown cms:nodejs /app/data

# Switch to non-root user
USER cms

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8081/health || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

# Labels
LABEL maintainer="CMS Team" \
      version="1.0.0" \
      description="Component Registry Microservice" \
      service="component-registry"