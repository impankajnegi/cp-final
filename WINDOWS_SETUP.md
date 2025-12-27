# 🪟 Windows Setup Guide - Chaarpaisa Docker

## Step-by-Step Instructions for Windows

### 1️⃣ Install Docker Desktop

1. **Download Docker Desktop**
   - Go to: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Run the installer (`Docker Desktop Installer.exe`)

2. **System Requirements**
   - Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 or higher)
   - OR Windows 11
   - Enable WSL 2 feature
   - BIOS virtualization enabled

3. **Install WSL 2** (if not already installed)
   Open PowerShell as Administrator and run:
   ```powershell
   wsl --install
   ```
   
   Restart your computer after installation.

4. **Start Docker Desktop**
   - Launch Docker Desktop from Start Menu
   - Wait for it to finish starting (you'll see "Docker Desktop is running" in system tray)

5. **Verify Installation**
   Open PowerShell or Command Prompt:
   ```powershell
   docker --version
   docker-compose --version
   ```

---

### 2️⃣ Download Project Files

**Option A: Using Git**
```powershell
git clone <repository-url>
cd chaarpaisa
```

**Option B: Download ZIP**
1. Download the project ZIP file
2. Extract to a folder (e.g., `C:\Projects\chaarpaisa`)
3. Open PowerShell in that folder

---

### 3️⃣ Start the Application

Open PowerShell in the project directory:

```powershell
# Start all services
docker-compose up -d
```

**What happens:**
- Downloads PostgreSQL image (first time only)
- Builds Next.js application
- Creates database
- Starts both services

**Expected Output:**
```
Creating network "chaarpaisa-network" ...
Creating chaarpaisa-db ...
Creating chaarpaisa-app ...
```

---

### 4️⃣ Wait for Services to Start

```powershell
# Check status
docker-compose ps
```

Wait until you see:
```
NAME              STATUS
chaarpaisa-db     Up (healthy)
chaarpaisa-app    Up
```

This usually takes 30-60 seconds on first run.

---

### 5️⃣ Seed the Database

```powershell
# Add test data
docker-compose exec app node scripts/seed.js
```

**You should see:**
```
✅ Admin user created
✅ Sample items created
✅ Renter user created
✅ Seller profile created

🎉 Database seeded successfully!
```

---

### 6️⃣ Access the Application

Open your browser and go to:
- **Main App**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health

---

## 🎮 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@chaarpaisa.com | admin123 |
| Owner | owner@test.com | password123 |
| Renter | renter@test.com | password123 |
| Seller | seller@test.com | password123 |

**Development OTP**: `123456`

---

## 📋 Common Commands (PowerShell)

### View Logs
```powershell
# All logs
docker-compose logs -f

# Only app logs
docker-compose logs -f app

# Only database logs
docker-compose logs -f postgres
```

### Stop Application
```powershell
docker-compose stop
```

### Start Application Again
```powershell
docker-compose start
```

### Restart Everything
```powershell
docker-compose restart
```

### Stop and Remove (keeps data)
```powershell
docker-compose down
```

### Complete Reset (removes all data)
```powershell
docker-compose down -v
docker system prune -a
```

### Rebuild After Code Changes
```powershell
docker-compose up -d --build
```

---

## 🐛 Troubleshooting Windows Issues

### Issue 1: "Docker Desktop is not running"

**Solution:**
1. Open Docker Desktop from Start Menu
2. Wait for it to fully start (green icon in system tray)
3. Try command again

---

### Issue 2: "Port 3000 is already in use"

**Solution:**
1. Check what's using port 3000:
   ```powershell
   netstat -ano | findstr :3000
   ```

2. Kill the process:
   ```powershell
   taskkill /PID <process_id> /F
   ```

3. OR change port in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

---

### Issue 3: "Access Denied" or Permission Errors

**Solution:**
1. Right-click Docker Desktop → Run as Administrator
2. Open PowerShell as Administrator
3. Run commands again

---

### Issue 4: "WSL 2 installation is incomplete"

**Solution:**
1. Open PowerShell as Administrator:
   ```powershell
   wsl --install
   wsl --set-default-version 2
   ```

2. Download WSL 2 kernel update:
   - https://aka.ms/wsl2kernel

3. Restart computer

---

### Issue 5: "Cannot connect to Docker daemon"

**Solution:**
1. Restart Docker Desktop
2. Check if virtualization is enabled in BIOS
3. In Docker Desktop: Settings → General → Enable "Use WSL 2 based engine"

---

### Issue 6: Database Won't Start

**Solution:**
```powershell
# Check database logs
docker-compose logs postgres

# Restart just the database
docker-compose restart postgres

# If still failing, reset database
docker-compose down -v
docker-compose up -d
```

---

### Issue 7: Build Fails with "No Space Left"

**Solution:**
1. Open Docker Desktop
2. Settings → Resources → Disk Image Size
3. Increase to at least 60GB
4. Clean up:
   ```powershell
   docker system prune -a --volumes
   ```

---

### Issue 8: Application Runs but Shows Errors

**Solution:**
```powershell
# Check application logs
docker-compose logs app

# Restart application
docker-compose restart app

# Rebuild if needed
docker-compose up -d --build
```

---

## 🔍 Verify Everything is Working

### 1. Check Services
```powershell
docker-compose ps
```

Both services should show "Up"

### 2. Check API
```powershell
curl http://localhost:3000/api/health
```

Should return:
```json
{"status":"ok","message":"Chaarpaisa API is running"}
```

### 3. Check Database
```powershell
docker-compose exec postgres psql -U postgres -d chaarpaisa -c "SELECT COUNT(*) FROM users;"
```

Should show: `count: 4`

### 4. Test Login
Open browser: http://localhost:3000/login
- Email: `owner@test.com`
- Password: `password123`

---

## 💡 Tips for Windows Users

### 1. Use PowerShell (Not CMD)
PowerShell has better command support

### 2. File Paths
Use forward slashes in docker commands:
```powershell
docker-compose exec app ls /app/public/uploads
```

### 3. Line Endings
If you edit files on Windows, Docker might have issues. Fix with:
```powershell
git config --global core.autocrlf false
```

### 4. Performance
For better performance:
- Store project in WSL filesystem: `\\wsl$\Ubuntu\home\user\chaarpaisa`
- OR enable "Use the WSL 2 based engine" in Docker Desktop

### 5. File Changes Not Reflecting
If code changes don't update:
```powershell
docker-compose down
docker-compose up -d --build
```

---

## 📱 Access from Phone/Other Devices

If you want to access from your phone on the same network:

1. Find your PC's IP address:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" under your Wi-Fi adapter

2. In `docker-compose.yml`, change:
   ```yaml
   environment:
     - NEXT_PUBLIC_BASE_URL=http://YOUR_IP:3000
   ```

3. Access from phone: `http://YOUR_IP:3000`

---

## 🎯 Quick Start Checklist

- [ ] Docker Desktop installed and running
- [ ] WSL 2 enabled
- [ ] Project files downloaded
- [ ] Opened PowerShell in project directory
- [ ] Run: `docker-compose up -d`
- [ ] Wait 60 seconds
- [ ] Run: `docker-compose exec app node scripts/seed.js`
- [ ] Open: http://localhost:3000
- [ ] Login with test account

---

## 🆘 Still Having Issues?

### Check System Resources
```powershell
docker stats
```

Make sure you have:
- At least 2GB RAM available
- At least 5GB disk space
- CPU usage under 80%

### Full Clean Restart
```powershell
# Stop everything
docker-compose down -v

# Remove all Docker data
docker system prune -a --volumes

# Restart Docker Desktop

# Start fresh
docker-compose up -d --build

# Wait 60 seconds
timeout /t 60

# Seed database
docker-compose exec app node scripts/seed.js
```

---

## 🎉 Success!

Once you see the application at http://localhost:3000, you're all set!

Try:
1. Login as Owner
2. Add some items
3. Login as Seller (different browser/incognito)
4. Make an offer
5. Login as Owner again
6. Accept the offer
7. Login as Seller
8. Lock deal and see barcode!

**Happy testing!** 🚀
