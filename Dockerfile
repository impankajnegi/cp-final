# Use Ubuntu 22.04 LTS as base
FROM ubuntu:22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    ca-certificates \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p public/uploads/items public/uploads/stores

# Build Next.js application
RUN yarn build

# Expose port
EXPOSE 3000

# Set permissions for entrypoint
RUN chmod +x docker-entrypoint.sh || true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["yarn", "start"]
