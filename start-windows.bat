@echo off
CLS
echo ========================================
echo   Chaarpaisa - Docker Setup for Windows
echo ========================================
echo.

echo [1/5] Checking Docker Desktop...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Docker Desktop is not installed or not running!
    echo.
    echo Please install Docker Desktop:
    echo 1. Download from: https://www.docker.com/products/docker-desktop
    echo 2. Install and restart your computer
    echo 3. Start Docker Desktop
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)
echo    ^>^> Docker Desktop is running

echo.
echo [2/5] Stopping any existing containers...
docker-compose down >nul 2>&1
echo    ^>^> Cleaned up old containers

echo.
echo [3/5] Building Docker images...
echo    This may take 3-5 minutes on first run...
docker-compose build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed!
    echo Try: docker system prune -a
    echo Then run this script again
    pause
    exit /b 1
)
echo    ^>^> Build complete

echo.
echo [4/5] Starting services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start services!
    echo Check: docker-compose logs
    pause
    exit /b 1
)
echo    ^>^> Services started

echo.
echo [5/5] Waiting for database (45 seconds)...
timeout /t 45 /nobreak >nul

echo.
echo Initializing database with test data...
docker-compose exec -T app node scripts/seed.js

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Application is now running at:
echo   ^>^> http://localhost:3000
echo.
echo Test Accounts:
echo   Owner:  owner@test.com / password123
echo   Seller: seller@test.com / password123
echo   Renter: renter@test.com / password123
echo   Admin:  admin@chaarpaisa.com / admin123
echo.
echo Development OTP: 123456
echo.
echo Useful Commands:
echo   View logs:    docker-compose logs -f
echo   Stop:         docker-compose down
echo   Restart:      docker-compose restart
echo.
echo Opening browser...
start http://localhost:3000
echo.
echo Press any key to see logs (Ctrl+C to exit)...
pause >nul
docker-compose logs -f
