# Render Dockerfile for Bun + SQLite backend
FROM oven/bun:1.2.19

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# Copy source code
COPY . .

# Create data directory for SQLite
RUN mkdir -p /data

# Build the application (creates dist/index.js)
RUN bun build src/index.ts --outdir dist --target bun

# Expose port
EXPOSE 3000

# Run migrations and start server
CMD bunx prisma migrate deploy && NODE_ENV=production bun run dist/index.js
