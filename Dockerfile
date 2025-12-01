# Render Dockerfile for Bun + SQLite backend
FROM oven/bun:1.2.19

# Install Python and build tools needed for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to backend
WORKDIR /app

# Copy backend files
COPY backend/package.json backend/bun.lock* ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# Copy shared types folder (needed for imports)
COPY shared /shared

# Copy all backend source code
COPY backend ./

# Create data directory for SQLite
RUN mkdir -p /data

# Expose port
EXPOSE 3000

# Run migrations and start server
CMD bunx prisma migrate deploy && NODE_ENV=production bun run src/index.ts
