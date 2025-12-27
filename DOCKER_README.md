# Chaarpaisa - Complete Docker Setup

## 🚀 Quick Start (Any Platform)

### Windows
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Double-click `start-windows.bat`
3. Wait 3-5 minutes
4. Open http://localhost:3000

### Mac / Linux
```bash
chmod +x start.sh
./start.sh
```

## 💻 Manual Setup

### Step 1: Build and Start
```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Step 2: Wait for Services
Wait 30-60 seconds for PostgreSQL to initialize

### Step 3: Seed Database
```bash
docker-compose exec app node scripts/seed.js
```

### Step 4: Access Application
Open browser: http://localhost:3000

## 📊 What's Included

### Docker Services
- **PostgreSQL 15** (Alpine Linux)
  - Port: 5432
  - Database: chaarpaisa
  - User: postgres / postgres
  - Persistent storage

- **Next.js App** (Ubuntu 22.04)
  - Port: 3000
  - Production build
  - Health checks enabled
  - Auto-restart on failure

### Pre-configured Environment
- All dependencies installed
- Database schema auto-created
- Test users ready to use
- File uploads configured

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@chaarpaisa.com | admin123 |
| Owner | owner@test.com | password123 |
| Seller | seller@test.com | password123 |
| Renter | renter@test.com | password123 |

**Development OTP**: `123456`

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Only app
docker-compose logs -f app

# Only database
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100
```

### Manage Services
```bash
# Stop services
docker-compose stop

# Start services
docker-compose start

# Restart services
docker-compose restart

# Stop and remove
docker-compose down

# Stop and remove volumes (complete reset)
docker-compose down -v
```

### Rebuild After Changes
```bash
# Rebuild and restart
docker-compose up -d --build

# Force rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Database Operations
```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d chaarpaisa

# Run SQL query
docker-compose exec postgres psql -U postgres -d chaarpaisa -c "SELECT * FROM users;"

# Backup database
docker-compose exec postgres pg_dump -U postgres chaarpaisa > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres chaarpaisa < backup.sql

# Re-seed database
docker-compose exec app node scripts/seed.js
```

### Shell Access
```bash
# App container
docker-compose exec app bash

# Database container
docker-compose exec postgres sh
```

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
```bash
# Option 1: Kill process using port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Option 2: Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

### Build Fails

**Error**: `failed to solve with frontend dockerfile.v0`

**Solution**:
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Database Won't Start

**Error**: `could not translate host name "postgres" to address`

**Solution**:
```bash
# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Complete reset
docker-compose down -v
docker-compose up -d
```

### Application Shows 500 Error

**Error**: `Internal Server Error`

**Solution**:
```bash
# Check app logs
docker-compose logs app

# Check if database is ready
docker-compose exec postgres pg_isready -U postgres

# Restart app
docker-compose restart app

# If still failing, check database connection
docker-compose exec app env | grep POSTGRES
```

### Out of Disk Space

**Error**: `no space left on device`

**Solution**:
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything
docker system prune -a --volumes
```

### Permission Issues (Linux)

**Error**: `permission denied`

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again

# OR run with sudo
sudo docker-compose up -d
```

### Container Keeps Restarting

**Solution**:
```bash
# Check why it's failing
docker-compose logs app

# Check health status
docker-compose ps

# Inspect container
docker inspect chaarpaisa-app
```

## 📊 Health Checks

### Verify Everything is Running

```bash
# 1. Check services status
docker-compose ps
# Both should show "Up" and "healthy"

# 2. Check API
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}

# 3. Check database
docker-compose exec postgres pg_isready -U postgres
# Should return: accepting connections

# 4. Check database data
docker-compose exec postgres psql -U postgres -d chaarpaisa -c "SELECT COUNT(*) FROM users;"
# Should return: 4
```

## 📦 Docker Image Details

### Base Images
- **App**: Ubuntu 22.04 LTS
  - Node.js 20.x
  - Yarn package manager
  - PostgreSQL client
  - Production optimized

- **Database**: PostgreSQL 15 Alpine
  - Lightweight (~80MB)
  - Production-ready
  - Persistent volumes

### Image Sizes
- postgres: ~80 MB
- app: ~600 MB (includes Node.js, dependencies, built app)

### Build Time
- First build: 3-5 minutes
- Subsequent builds: 30-60 seconds (cached layers)

## 🔒 Security Notes

### For Production

1. **Change Default Passwords**
   ```yaml
   # In docker-compose.yml
   POSTGRES_PASSWORD: your_strong_password
   JWT_SECRET: your_random_secret_key
   ```

2. **Don't Expose PostgreSQL Port**
   ```yaml
   # Remove or comment out
   # ports:
   #   - "5432:5432"
   ```

3. **Use Environment File**
   ```bash
   # Create .env file
   echo "POSTGRES_PASSWORD=your_password" > .env
   echo "JWT_SECRET=your_secret" >> .env
   
   # Update docker-compose.yml
   env_file:
     - .env
   ```

4. **Enable HTTPS**
   Use nginx or Caddy as reverse proxy

## 🔄 Development vs Production

### Development Mode (Hot Reload)

Create `docker-compose.dev.yml`:
```yaml
services:
  app:
    build:
      target: development
    command: yarn dev
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
```

Run:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production Mode (Current Setup)
- Optimized build
- No source code mounted
- Smaller image size
- Better performance

## 📚 Additional Resources

- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- **Docker Docs**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **PostgreSQL Image**: https://hub.docker.com/_/postgres

## ✅ Success Checklist

- [ ] Docker Desktop installed
- [ ] Services running (`docker-compose ps`)
- [ ] API responding (`curl http://localhost:3000/api/health`)
- [ ] Database seeded (4 test users)
- [ ] Can login at http://localhost:3000/login
- [ ] Can browse items
- [ ] Can create items (as owner)
- [ ] Can make offers (as seller)

## 🎉 You're All Set!

The application is now running in Docker containers. No need to install PostgreSQL, Node.js, or any dependencies locally!

**Quick Test**: Login as `owner@test.com` / `password123` and start adding items!
