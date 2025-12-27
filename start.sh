#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Chaarpaisa - Docker Setup"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed!${NC}"
    echo "Please install Docker first:"
    echo "  - Ubuntu/Debian: sudo apt-get install docker.io docker-compose"
    echo "  - Mac: https://www.docker.com/products/docker-desktop"
    echo "  - Windows: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}ERROR: Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

echo -e "${GREEN}[1/5]${NC} Docker found"

# Stop existing containers
echo -e "${GREEN}[2/5]${NC} Stopping existing containers..."
docker-compose down 2>/dev/null

# Build images
echo -e "${GREEN}[3/5]${NC} Building Docker images..."
echo "      This may take 3-5 minutes on first run..."
docker-compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Build failed!${NC}"
    echo "Try running: docker system prune -a"
    exit 1
fi

# Start services
echo -e "${GREEN}[4/5]${NC} Starting services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to start services!${NC}"
    echo "Check logs with: docker-compose logs"
    exit 1
fi

# Wait for services
echo -e "${GREEN}[5/5]${NC} Waiting for database to be ready..."
sleep 45

# Seed database
echo ""
echo "Initializing database with test data..."
docker-compose exec -T app node scripts/seed.js

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo -e "${GREEN}Application is running at:${NC}"
echo "  >> http://localhost:3000"
echo ""
echo "Test Accounts:"
echo "  Owner:  owner@test.com / password123"
echo "  Seller: seller@test.com / password123"
echo "  Renter: renter@test.com / password123"
echo "  Admin:  admin@chaarpaisa.com / admin123"
echo ""
echo "Development OTP: 123456"
echo ""
echo "Useful Commands:"
echo "  View logs:    docker-compose logs -f"
echo "  Stop:         docker-compose down"
echo "  Restart:      docker-compose restart"
echo ""
