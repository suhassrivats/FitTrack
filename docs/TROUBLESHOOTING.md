# FitTrack Troubleshooting Guide

Common issues and their solutions for the FitTrack application.

---

## Backend Issues

### Issue: Database not found or empty

**Symptoms:**
- API returns empty results
- Error messages about missing tables
- 500 Internal Server Error

**Solutions:**

**Using Docker (Recommended):**
```bash
# Re-seed the database
docker-compose exec backend python seed_data.py

# Or rebuild completely:
docker-compose down -v  # Remove volumes
docker-compose up -d --build
```

**Local (without Docker):**
```bash
cd backend
python seed_data.py
```

---

### Issue: Port 5000 already in use

**Symptoms:**
- Error: `Address already in use`
- Cannot start backend server
- Port binding error

**Solutions:**

**macOS/Linux:**
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or check what's using it first
lsof -i :5000
```

**Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual Process ID)
taskkill /PID <PID> /F
```

**Alternative - Change port:**
```bash
# Stop Docker containers
docker-compose down

# Edit docker-compose.yml and change:
# ports:
#   - "5001:5000"  # Use port 5001 instead
```

---

### Issue: Docker container won't start

**Symptoms:**
- Container exits immediately
- Container status shows "Exited"
- Backend not accessible

**Solutions:**

```bash
# View error logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build

# Remove all FitTrack containers and images
docker-compose down -v
docker rmi fittrack-backend

# Check Docker daemon is running
docker ps
```

---

### Issue: Code changes not reflecting

**Symptoms:**
- Changes to code don't appear in running app
- Old behavior persists after updates

**Solutions:**

```bash
# Restart the backend container
docker-compose restart backend

# Or rebuild if dependencies changed
docker-compose up -d --build

# For hot-reload, ensure volumes are mounted correctly in docker-compose.yml
```

---

### Issue: Module not found errors (local installation)

**Symptoms:**
- `ModuleNotFoundError` when running Python
- Import errors
- Missing dependencies

**Solutions:**

```bash
# Reinstall dependencies
cd backend
pip install -r requirements.txt

# If using system Python, ensure you're using Python 3.8+
python3 --version

# Check if dependencies are installed
pip list | grep flask
```

---

### Issue: JWT Authentication errors

**Symptoms:**
- `422 {"msg": "Subject must be a string"}`
- `401 Unauthorized` errors
- Token validation failures

**Solutions:**

```bash
# Clear old tokens (in mobile app)
# Logout and login again to get fresh token

# Check backend logs for JWT errors
docker-compose logs backend | grep -i jwt

# Verify JWT_SECRET_KEY is set
docker-compose exec backend env | grep JWT
```

---

### Issue: Backend returns 500 Internal Server Error

**Symptoms:**
- All API calls return 500 error
- Server error page displayed

**Solutions:**

```bash
# Check backend logs
docker-compose logs -f backend

# Common causes:
# 1. Database schema mismatch - restart with fresh database
docker-compose down -v
docker-compose up -d

# 2. Missing environment variables - check .env file
cat .env

# 3. Python errors - check logs for traceback
docker-compose logs backend | grep -A 20 "Error"
```

---

## Mobile App Issues

### Issue: Cannot connect to backend

**Symptoms:**
- "Network Error" in app
- API calls fail
- Cannot load data

**Solutions:**

1. **Verify backend is running:**
   ```bash
   # Check Docker containers
   docker-compose ps
   
   # Test the API
   curl http://localhost:5000/api/exercises
   ```

2. **Check API_URL configuration:**
   - Edit `mobile/src/services/api.js`
   - Verify the URL matches your setup:
     - iOS Simulator: `http://localhost:5000/api`
     - Android Emulator: `http://10.0.2.2:5000/api`
     - Physical Device: `http://YOUR_IP:5000/api` (use your computer's IP)

3. **Network connectivity:**
   - Ensure both devices are on the same network
   - Check firewall allows connections on port 5000
   - For physical devices, use your computer's IP address (not localhost)

4. **Check Docker logs:**
   ```bash
   docker-compose logs backend
   ```

---

### Issue: Expo not starting

**Symptoms:**
- Expo server won't start
- Errors when running `npx expo start`
- Cache-related errors

**Solutions:**

```bash
# Clear Expo cache
cd mobile
expo start -c
# or
npx expo start --clear

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :8081  # Expo default port
```

---

### Issue: Module not found errors (mobile)

**Symptoms:**
- Import errors in mobile app
- "Unable to resolve module" errors
- Missing dependencies

**Solutions:**

```bash
# Reinstall node modules
cd mobile
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
npx expo start --clear

# Check package.json for missing dependencies
cat package.json
```

---

### Issue: iOS Simulator not opening

**Symptoms:**
- Simulator won't launch
- Xcode errors
- "No simulator available" message

**Solutions:**

1. **Ensure Xcode is installed:**
   ```bash
   xcode-select --install
   ```

2. **Install simulators:**
   - Open Xcode
   - Go to Preferences → Components
   - Install iOS simulators

3. **Check Xcode command line tools:**
   ```bash
   xcode-select -p
   # Should show: /Applications/Xcode.app/Contents/Developer
   ```

4. **Manually open simulator:**
   ```bash
   open -a Simulator
   ```

---

### Issue: Android Emulator not connecting

**Symptoms:**
- Emulator won't connect to Expo
- Connection timeout
- "Unable to connect" errors

**Solutions:**

1. **Ensure Android Studio is installed**
2. **Create and start an AVD (Android Virtual Device):**
   - Open Android Studio
   - Tools → Device Manager
   - Create Virtual Device
   - Start the emulator

3. **Use correct API URL:**
   - In `mobile/src/services/api.js`:
   ```javascript
   export const API_URL = 'http://10.0.2.2:5000/api';
   ```
   (10.0.2.2 is the special IP that maps to host machine's localhost)

4. **Check ADB connection:**
   ```bash
   adb devices
   # Should show your emulator
   ```

---

### Issue: Physical device cannot reach API

**Symptoms:**
- App on phone can't connect to backend
- Network timeout errors
- "Connection refused" errors

**Solutions:**

1. **Find your computer's IP address:**

   **macOS/Linux:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # or
   hostname -I
   ```

   **Windows:**
   ```bash
   ipconfig
   # Look for IPv4 Address
   ```

2. **Update API_URL in mobile app:**
   - Edit `mobile/src/services/api.js`
   - Set to: `http://YOUR_IP:5000/api` (replace YOUR_IP with actual IP)

3. **Firewall settings:**
   - Ensure firewall allows connections on port 5000
   - macOS: System Preferences → Security & Privacy → Firewall
   - Windows: Windows Defender Firewall → Allow an app

4. **Network connectivity:**
   - Both devices must be on the same Wi-Fi network
   - Test connection: Open `http://YOUR_IP:5000/api/exercises` in phone's browser

---

### Issue: App crashes on startup

**Symptoms:**
- App closes immediately after opening
- Red error screen
- JavaScript errors

**Solutions:**

```bash
# Check Expo logs
cd mobile
npx expo start

# Clear cache and restart
rm -rf .expo
npx expo start -c

# Check for syntax errors
npm run lint  # if configured

# View error logs in Expo
# Red screen will show the error details
```

---

### Issue: Authentication not working

**Symptoms:**
- Can't login or register
- Stuck on login screen
- Token errors

**Solutions:**

1. **Check backend is running and accessible**
2. **Clear app data:**
   - In Expo Go: Shake device → Clear cache
   - Or uninstall and reinstall Expo Go

3. **Verify API_URL is correct:**
   - Check `mobile/src/services/api.js`
   - Test endpoint manually: `curl http://YOUR_API_URL/auth/register`

4. **Check backend logs for auth errors:**
   ```bash
   docker-compose logs backend | grep -i auth
   ```

---

### Issue: Images or assets not loading

**Symptoms:**
- Broken image icons
- Missing assets
- 404 errors for images

**Solutions:**

```bash
# Clear Expo cache
cd mobile
npx expo start --clear

# Restart Metro bundler
# Stop current server (Ctrl+C) and restart
npx expo start

# Check asset paths in code
# Ensure paths are correct relative to project structure
```

---

## Database Issues

### Issue: Database locked or corrupted

**Symptoms:**
- Database errors
- "Database is locked" messages
- Corrupted data

**Solutions:**

```bash
# Restart Docker container (releases locks)
docker-compose restart backend

# Recreate database
docker-compose down -v
docker-compose up -d

# For local SQLite, check file permissions
ls -la backend/instance/
```

---

## General Issues

### Issue: Slow performance

**Solutions:**

1. **Backend:**
   ```bash
   # Check Docker resource allocation
   docker stats
   
   # Increase resources if needed
   # Docker Desktop → Preferences → Resources
   ```

2. **Mobile:**
   - Clear Expo cache
   - Restart development server
   - Check for memory leaks in app

---

### Issue: Git merge conflicts

**Symptoms:**
- Conflicts in package files
- Merge errors

**Solutions:**

```bash
# For package.json conflicts, usually safe to accept incoming
git checkout --theirs mobile/package.json

# Then reinstall dependencies
cd mobile
rm -rf node_modules package-lock.json
npm install
```

---

## Getting Help

If you're still experiencing issues:

1. **Check logs:**
   ```bash
   # Backend logs
   docker-compose logs -f backend
   
   # Mobile/Expo logs
   # Visible in terminal where expo start is running
   ```

2. **Verify setup:**
   - Backend is running on port 5000
   - Mobile app API_URL is correctly configured
   - Both devices are on same network (for physical device)

3. **Common checklist:**
   - [ ] Docker is running
   - [ ] Backend container is up (`docker-compose ps`)
   - [ ] API is accessible (`curl http://localhost:5000/api/exercises`)
   - [ ] API_URL in mobile app matches your setup
   - [ ] Firewall allows port 5000
   - [ ] Both devices on same network (physical device)

For more information, see other documentation:
- [RESTART_BACKEND.md](./RESTART_BACKEND.md) - Backend restart procedures
- [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) - Testing API endpoints
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment troubleshooting

