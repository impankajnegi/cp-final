@echo off
echo ========================================
echo   Chaarpaisa - Windows Quick Start
echo ========================================
echo.

echo Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker found!
echo.

echo Starting services...
docker-compose up -d

echo.
echo Waiting for services to start (30 seconds)...
timeout /t 30 /nobreak

echo.
echo Seeding database with test data...
docker-compose exec -T app node scripts/seed.js

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Access the application at:
echo   http://localhost:3000
echo.
echo Test Accounts:
echo   Owner:  owner@test.com / password123
echo   Seller: seller@test.com / password123
echo   Renter: renter@test.com / password123
echo   Admin:  admin@chaarpaisa.com / admin123
echo.
echo Development OTP: 123456
echo.
echo To stop: docker-compose down
echo To view logs: docker-compose logs -f
echo.
pause
