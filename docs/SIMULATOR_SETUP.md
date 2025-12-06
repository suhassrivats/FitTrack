# Running FitTrack in Simulator

This guide will help you run the FitTrack mobile app in iOS or Android simulators.

## Prerequisites

1. **Backend Running**: Make sure your backend is running (see below)
2. **Node.js**: Install Node.js 16+ if not already installed
3. **Expo CLI**: Install globally with `npm install -g expo-cli` (optional, can use npx)

### For iOS Simulator (Mac only):
- Xcode installed (from App Store)
- iOS Simulator (comes with Xcode)

### For Android Emulator:
- Android Studio installed
- Android SDK and emulator configured

## Step 1: Start the Backend

First, make sure your backend is running:

```bash
# Option 1: Using Docker (Recommended)
cd /Users/suhassrivats/Documents/suhas/FitTrack
docker-compose up -d

# Option 2: Local Python
cd backend
python app.py
```

The backend should be running at `http://localhost:5000`

Verify it's working:
```bash
curl http://localhost:5000/health
```

## Step 2: Configure API URL for Simulator

The API configuration needs to be set correctly for your simulator:

### For iOS Simulator:
- Use `http://localhost:5000/api` (iOS Simulator can access localhost)

### For Android Emulator:
- Use `http://10.0.2.2:5000/api` (Android emulator uses 10.0.2.2 to access host machine's localhost)

### For Physical Device:
- Use your computer's IP address: `http://YOUR_IP:5000/api`
- Find your IP: `ifconfig | grep inet` (Mac/Linux) or `ipconfig` (Windows)

**Update the API URL:**

Edit `mobile/src/services/api.js` and change line 7-9:

```javascript
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api'
  : Platform.OS === 'ios'
    ? 'http://localhost:5000/api'  // iOS Simulator
    : 'http://10.0.2.2:5000/api';   // Android Emulator (or use your IP for physical device)
```

## Step 3: Install Dependencies

```bash
cd mobile
npm install
```

## Step 4: Start Expo Development Server

```bash
cd mobile
npx expo start
```

This will:
- Start the Metro bundler
- Show a QR code
- Display options to open in simulator

## Step 5: Open in Simulator

### iOS Simulator (Mac only):

**Option A: From Expo CLI**
```bash
# In the terminal where expo start is running, press:
i
```

**Option B: From Xcode**
1. Open Xcode
2. Go to Xcode → Open Developer Tool → Simulator
3. Choose a device (e.g., iPhone 15 Pro)
4. The app should automatically open when Expo detects the simulator

**Option C: Manual**
```bash
# Open iOS Simulator first
open -a Simulator

# Then in the Expo terminal, press 'i'
```

### Android Emulator:

**Option A: From Expo CLI**
```bash
# Make sure Android emulator is running first
# Then in the Expo terminal, press:
a
```

**Option B: Start Emulator First**
```bash
# Start Android emulator
emulator -avd <your_avd_name>

# Or open Android Studio → Tools → Device Manager → Start emulator

# Then in Expo terminal, press 'a'
```

## Troubleshooting

### Backend Connection Issues

**iOS Simulator:**
- Make sure backend is running on `localhost:5000`
- Check that API URL in `api.js` is `http://localhost:5000/api`
- Try restarting the simulator

**Android Emulator:**
- Make sure backend is running on `localhost:5000`
- Check that API URL in `api.js` is `http://10.0.2.2:5000/api`
- If 10.0.2.2 doesn't work, find your computer's IP and use that

### Expo Won't Start

```bash
# Clear cache and restart
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

### Simulator Not Opening

**iOS:**
```bash
# Check if Xcode is installed
xcode-select --version

# Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all
```

**Android:**
```bash
# Check if emulator is in PATH
emulator -list-avds

# Start emulator manually first
emulator -avd <avd_name>
```

### API Connection Errors

1. **Check backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check CORS settings** in `backend/app.py` - should allow all origins for development

3. **Verify API URL** matches your setup:
   - iOS Simulator: `http://localhost:5000/api`
   - Android Emulator: `http://10.0.2.2:5000/api`
   - Physical Device: `http://YOUR_COMPUTER_IP:5000/api`

### Port Already in Use

If port 5000 is already in use:
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process or change backend port
```

## Quick Commands Reference

```bash
# Start backend (Docker)
docker-compose up -d

# Start backend (Local)
cd backend && python app.py

# Start mobile app
cd mobile && npx expo start

# Open iOS Simulator
i  # (in Expo terminal)

# Open Android Emulator
a  # (in Expo terminal)

# Clear Expo cache
npx expo start --clear

# View backend logs
docker-compose logs -f backend
```

## Testing the App

Once the app opens in the simulator:

1. **Register a new account:**
   - Tap "Register" or "Sign Up"
   - Enter email, username, password
   - Optionally set role to "instructor" if you want to create classes

2. **Login:**
   - Use the credentials you just created

3. **Test Features:**
   - Browse exercises
   - Create a workout
   - Log a meal
   - View profile

## Next Steps

- Update API URL for production deployment
- Configure environment variables
- Set up push notifications (if needed)
- Configure app icons and splash screens

---

**Need Help?**
- Check Expo docs: https://docs.expo.dev/
- Check React Native docs: https://reactnative.dev/
- View backend logs: `docker-compose logs -f backend`

