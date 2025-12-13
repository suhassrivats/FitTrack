# App Store Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. App Configuration
- [x] API URL set to production (`https://fittrack-api.fly.dev/api`)
- [x] `app.json` updated with App Store metadata
- [x] `eas.json` configured for production builds
- [ ] Bundle identifier verified (currently: `com.fittrack.mobile`)
- [ ] App version set (currently: 1.0.0)

### 2. Required Assets
- [ ] **App Icon**: `assets/icon.png` (1024x1024px, PNG, no transparency)
- [ ] **Splash Screen**: `assets/splash.png` (1284x2778px recommended)
- [ ] **App Screenshots** (at least one set required):
  - [ ] iPhone 6.7" (1290 x 2796px) - 3-10 screenshots
  - [ ] iPhone 6.5" (1242 x 2688px) - Optional
  - [ ] iPhone 5.5" (1242 x 2208px) - Optional

### 3. Apple Developer Account
- [ ] Enrolled in Apple Developer Program ($99/year)
- [ ] App ID created in Apple Developer Portal
- [ ] App Store Connect app created

### 4. App Store Listing Content
- [ ] App name: FitTrack
- [ ] Subtitle (30 characters max)
- [ ] Description (4000 characters max)
- [ ] Keywords (100 characters max)
- [ ] Category: Health & Fitness
- [ ] Privacy Policy URL (REQUIRED)
- [ ] Support URL
- [ ] Marketing URL (optional)

### 5. Testing
- [ ] Tested on physical iOS device
- [ ] All features working with production API
- [ ] Login/Registration flow tested
- [ ] Workout logging tested
- [ ] Class features tested
- [ ] No crashes or critical bugs

## 🚀 Deployment Steps

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Step 2: Create App Icons
Create `mobile/assets/icon.png` (1024x1024px)

### Step 3: Build for App Store
```bash
cd mobile
eas build --platform ios --profile production
```

### Step 4: Submit to App Store
```bash
eas submit --platform ios --profile production
```

### Step 5: Complete App Store Connect
- Fill in app description, screenshots, etc.
- Submit for review

## 📝 Quick Start Commands

```bash
# 1. Install and login
npm install -g eas-cli
eas login

# 2. Navigate to mobile directory
cd mobile

# 3. Configure (first time only)
eas build:configure

# 4. Build for App Store
eas build --platform ios --profile production

# 5. Submit (after build completes)
eas submit --platform ios --profile production
```

## ⚠️ Important Notes

1. **Bundle Identifier**: Make sure `com.fittrack.mobile` is available or change it
2. **Privacy Policy**: You MUST have a publicly accessible privacy policy URL
3. **First Build**: Takes 15-20 minutes, subsequent builds are faster
4. **Review Time**: Usually 24-48 hours, can take up to 7 days

## 📚 Full Guide

See `APP_STORE_DEPLOYMENT.md` for detailed instructions.

