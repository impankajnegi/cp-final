# 🐳 Chaarpaisa - Docker Setup Guide

## Prerequisites

### Windows
1. Install **Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop
   - Minimum requirements: Windows 10 64-bit (Pro, Enterprise, or Education)
   - Enable WSL 2 (Windows Subsystem for Linux)

2. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

### Mac
1. Install **Docker Desktop for Mac**
   - Download from: https://www.docker.com/products/docker-desktop

### Linux
1. Install Docker Engine and Docker Compose
   ```bash
   sudo apt-get update
   sudo apt-get install docker.io docker-compose
   ```

---

## 🚀 Quick Start

### 1. Navigate to Project Directory
```bash
cd /path/to/chaarpaisa
```

### 2. Start the Application
```bash
docker-compose up -d
```

This will:
- ✅ Pull PostgreSQL 15 image
- ✅ Build Next.js application
- ✅ Create and initialize database
- ✅ Start both services

### 3. Check Status
```bash
docker-compose ps
```

You should see:
```
NAME                 IMAGE              STATUS
chaarpaisa-db        postgres:15-alpine   Up (healthy)
chaarpaisa-app       chaarpaisa-app       Up
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

---

## 📊 Seed Database

### Option 1: Manual Seeding (Recommended)
```bash
docker-compose exec app node scripts/seed.js
```

### Option 2: Automatic on First Run
The database will be automatically seeded when you first start the containers.

---

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Only app
docker-compose logs -f app

# Only database
docker-compose logs -f postgres
```

### Stop Application
```bash
docker-compose stop
```

### Start Application
```bash
docker-compose start
```

### Restart Application
```bash
docker-compose restart
```

### Stop and Remove Containers
```bash
docker-compose down
```

### Stop and Remove Everything (including data)
```bash
docker-compose down -v
```

### Rebuild Application
```bash
docker-compose up -d --build
```

---

## 🗄️ Database Management

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U postgres -d chaarpaisa
```

### Common SQL Commands
```sql
-- List all tables
\dt

-- View users
SELECT * FROM users;

-- View items
SELECT * FROM items;

-- View offers
SELECT * FROM offers;

-- Exit
\q
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres chaarpaisa > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U postgres chaarpaisa < backup.sql
```

---

## 🔧 Troubleshooting

### Port Already in Use

**Problem**: Port 3000 or 5432 already in use

**Solution**: Change ports in `docker-compose.yml`
```yaml
ports:
  - "3001:3000"  # Change 3001 to any available port
```

### Database Connection Issues

**Problem**: App can't connect to database

**Solution**:
1. Check database health:
   ```bash
   docker-compose ps
   ```
2. Wait for database to be healthy:
   ```bash
   docker-compose logs postgres
   ```
3. Restart services:
   ```bash
   docker-compose restart
   ```

### Build Failures

**Problem**: Docker build fails

**Solution**:
1. Clear Docker cache:
   ```bash
   docker system prune -a
   ```
2. Rebuild:
   ```bash
   docker-compose up -d --build --force-recreate
   ```

### Permission Issues (Windows)

**Problem**: File permission errors

**Solution**:
1. Ensure Docker Desktop has access to the drive
2. In Docker Desktop: Settings → Resources → File Sharing
3. Add the project folder

### Uploads Not Persisting

**Problem**: Uploaded images disappear after restart

**Solution**: The `public/uploads` folder is mounted as a volume. Ensure it exists:
```bash
mkdir -p public/uploads/items public/uploads/stores
```

---

## 🔄 Development Workflow

### Live Reload (Development Mode)

For development with hot reload, modify `docker-compose.yml`:

```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile.dev  # Create this for dev
  command: yarn dev
  volumes:
    - .:/app
    - /app/node_modules
    - /app/.next
```

### Install New Dependencies
```bash
# Add package
docker-compose exec app yarn add package-name

# Rebuild
docker-compose up -d --build
```

---

## 📝 Environment Variables

Edit `docker-compose.yml` to change environment variables:

```yaml
environment:
  - JWT_SECRET=your_secret_here
  - RAZORPAY_KEY_ID=your_key
  - RAZORPAY_KEY_SECRET=your_secret
  - TWILIO_ACCOUNT_SID=your_sid
  - TWILIO_AUTH_TOKEN=your_token
```

Or create `.env` file:
```bash
JWT_SECRET=your_secret_here
RAZORPAY_KEY_ID=your_key
```

And reference in docker-compose.yml:
```yaml
env_file:
  - .env
```

---

## 🧪 Testing

### Run Tests Inside Container
```bash
docker-compose exec app yarn test
```

### Access Shell
```bash
docker-compose exec app sh
```

---

## 🚀 Production Deployment

### 1. Update Environment Variables
Replace all placeholder values in `docker-compose.yml`

### 2. Use Production Build
Ensure `NODE_ENV=production` is set

### 3. Enable HTTPS
Add nginx or use a reverse proxy:
```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
```

### 4. Backup Strategy
Schedule regular database backups:
```bash
# Add to cron
0 2 * * * docker-compose exec postgres pg_dump -U postgres chaarpaisa > /backups/backup_$(date +%Y%m%d).sql
```

---

## 📊 Monitoring

### Container Stats
```bash
docker stats
```

### Resource Usage
```bash
docker-compose top
```

---

## 🆘 Support

### View All Logs
```bash
docker-compose logs --tail=100
```

### Restart Everything
```bash
docker-compose down && docker-compose up -d
```

### Complete Reset
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## ✅ Health Checks

### Application Health
```bash
curl http://localhost:3000/api/health
```

### Database Health
```bash
docker-compose exec postgres pg_isready -U postgres
```

---

## 🎯 Test Accounts

After seeding, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@chaarpaisa.com | admin123 |
| Owner | owner@test.com | password123 |
| Renter | renter@test.com | password123 |
| Seller | seller@test.com | password123 |

**Development OTP**: `123456`

---

## 🎉 Quick Start Summary

```bash
# 1. Start everything
docker-compose up -d

# 2. Wait for services (30 seconds)
sleep 30

# 3. Seed database
docker-compose exec app node scripts/seed.js

# 4. Open browser
# http://localhost:3000

# 5. Login
# Email: owner@test.com
# Password: password123
```

**That's it! Your Chaarpaisa app is running!** 🚀
