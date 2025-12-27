# Use Node.js LTS version
FROM node:20-alpine

# Install PostgreSQL client for seeding
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application files
COPY . .

# Build Next.js application
RUN yarn build

# Expose port
EXPOSE 3000

# Start command
CMD ["yarn", "start"]
