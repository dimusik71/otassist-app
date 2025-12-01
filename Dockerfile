# Render Dockerfile for Bun + SQLite backend
FROM oven/bun:1.2.19

# Set working directory to backend
WORKDIR /app

# Copy backend files
COPY backend/package.json backend/bun.lock* ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# Copy all backend source code
COPY backend ./

# Create data directory for SQLite
RUN mkdir -p /data

# Expose port
EXPOSE 3000

# Run migrations and start server
CMD bunx prisma migrate deploy && NODE_ENV=production bun run src/index.ts
