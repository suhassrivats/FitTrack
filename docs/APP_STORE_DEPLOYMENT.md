# App Store Deployment Guide for FitTrack

This guide will walk you through deploying FitTrack to the Apple App Store using Expo Application Services (EAS).

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com/programs/
   - Required for App Store submission

2. **Expo Account** (Free)
   - Sign up at: https://expo.dev/
   - Required for EAS builds

3. **EAS CLI** installed
   ```bash
   npm install -g eas-cli
   ```

## Step 1: Install EAS CLI and Login

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Link your project (if not already linked)
cd mobile
eas build:configure
```

## Step 2: Update App Configuration

The `app.json` has been updated with App Store requirements. You may need to:

1. **Update Bundle Identifier** (if needed):
   - Current: `com.fittrack.mobile`
   - Must be unique and match your Apple Developer account
   - Change in `app.json` → `ios.bundleIdentifier`

2. **Add App Icons and Splash Screen**:
   - Create `assets/icon.png` (1024x1024px)
   - Create `assets/splash.png` (1284x2778px for iPhone)
   - Create `assets/adaptive-icon.png` (1024x1024px for Android)

## Step 3: Create App Icons

You need to create app icons. Here are the required sizes:

### iOS Icon
- **Size**: 1024x1024px
- **Format**: PNG
- **Location**: `mobile/assets/icon.png`
- **No transparency, no rounded corners** (Apple will add them)

### Splash Screen
- **Size**: 1284x2778px (iPhone 14 Pro Max size)
- **Format**: PNG
- **Location**: `mobile/assets/splash.png`

You can use online tools like:
- https://www.appicon.co/
- https://www.makeappicon.com/
- Or design in Figma/Photoshop

## Step 4: Configure EAS Build

Update `eas.json` for production builds:

```json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-medium",
        "distribution": "store"
      }
    }
  }
}
```

## Step 5: Build for App Store

```bash
cd mobile

# Build iOS app for App Store
eas build --platform ios --profile production
```

This will:
1. Prompt you to create an Expo account (if not logged in)
2. Create an EAS project (if not already created)
3. Build your app in the cloud
4. Generate an `.ipa` file ready for App Store submission

**Note**: First build may take 15-20 minutes. Subsequent builds are faster.

## Step 6: Set Up Apple Developer Account

1. **Enroll in Apple Developer Program**:
   - Go to: https://developer.apple.com/programs/
   - Pay $99/year fee
   - Complete enrollment (can take 24-48 hours)

2. **Create App ID**:
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Click "+" to create new App ID
   - Use bundle identifier: `com.fittrack.mobile`
   - Enable required capabilities

3. **Create App Store Connect App**:
   - Go to: https://appstoreconnect.apple.com/
   - Click "My Apps" → "+" → "New App"
   - Fill in:
     - Platform: iOS
     - Name: FitTrack
     - Primary Language: English
     - Bundle ID: com.fittrack.mobile
     - SKU: fittrack-ios-001 (unique identifier)

## Step 7: Configure App Store Listing

In App Store Connect, prepare your listing:

### Required Information:
- **App Name**: FitTrack
- **Subtitle**: Track workouts, join classes, achieve goals
- **Description**: 
  ```
  FitTrack is a comprehensive fitness tracking app that helps you:
  
  • Log workouts with detailed exercise tracking
  • Create and follow custom workout routines
  • Join fitness classes and compete on leaderboards
  • Track progress with detailed statistics
  • Access exercise library with instructions
  
  Perfect for individuals and fitness instructors managing classes.
  ```
- **Keywords**: fitness, workout, exercise, tracking, gym, training
- **Category**: Health & Fitness
- **Privacy Policy URL**: (Required - create a privacy policy page)
- **Support URL**: (Your website or support email)

### App Screenshots (Required):
You need screenshots for:
- iPhone 6.7" (1290 x 2796 pixels) - iPhone 14 Pro Max
- iPhone 6.5" (1242 x 2688 pixels) - iPhone 11 Pro Max
- iPhone 5.5" (1242 x 2208 pixels) - iPhone 8 Plus

**How to capture screenshots:**
1. Run app in iOS Simulator
2. Use Cmd+S to save screenshots
3. Or use physical device and take screenshots

### App Icon:
- Upload your 1024x1024px icon

## Step 8: Submit to App Store

### Option A: Using EAS Submit (Recommended)

```bash
# After build completes, submit directly
eas submit --platform ios --profile production
```

This will:
1. Ask for Apple ID credentials
2. Upload the build to App Store Connect
3. Create a new version in App Store Connect

### Option B: Manual Submission

1. Download the `.ipa` file from EAS build page
2. Use **Transporter** app (Mac) or **Application Loader**
3. Upload the `.ipa` file

## Step 9: Complete App Store Connect Submission

1. **Go to App Store Connect**:
   - https://appstoreconnect.apple.com/
   - Select your app

2. **Create New Version**:
   - Click "+ Version or Platform"
   - Enter version: 1.0.0
   - Build: Select the build you just uploaded

3. **Fill Required Information**:
   - Screenshots (required)
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)
   - Privacy Policy URL (required)

4. **App Review Information**:
   - Contact information
   - Demo account (if app requires login)
   - Notes for reviewer

5. **Version Information**:
   - What's New: "Initial release of FitTrack"

6. **Submit for Review**:
   - Click "Submit for Review"
   - Answer export compliance questions
   - Submit!

## Step 10: App Review Process

- **Timeline**: Usually 24-48 hours, can take up to 7 days
- **Status Updates**: Check App Store Connect dashboard
- **If Rejected**: Address issues and resubmit

## Important Notes

### Before Submitting:

1. **Test Thoroughly**:
   - Test on physical iOS device
   - Test all features
   - Test with production API (Fly.io)

2. **Privacy Policy**:
   - Required by Apple
   - Must be accessible via URL
   - Should explain data collection/usage

3. **App Store Guidelines**:
   - Review: https://developer.apple.com/app-store/review/guidelines/
   - Ensure compliance

4. **API Configuration**:
   - Verify API URL is set to production: `https://fittrack-api.fly.dev/api`
   - Test all API endpoints work

### Common Issues:

1. **Missing Icons**: Ensure `assets/icon.png` exists (1024x1024)
2. **Bundle ID Conflict**: Change if `com.fittrack.mobile` is taken
3. **Privacy Policy**: Must be publicly accessible URL
4. **Screenshots**: Required for at least one device size

## Quick Commands Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

## Next Steps After Approval

1. **Monitor Reviews**: Respond to user reviews
2. **Update Regularly**: Fix bugs, add features
3. **Version Updates**: Use semantic versioning (1.0.1, 1.1.0, etc.)
4. **Analytics**: Consider adding analytics (Firebase, Mixpanel)

## Need Help?

- **EAS Docs**: https://docs.expo.dev/build/introduction/
- **App Store Review**: https://developer.apple.com/app-store/review/
- **Expo Forums**: https://forums.expo.dev/

Good luck with your App Store submission! 🚀

