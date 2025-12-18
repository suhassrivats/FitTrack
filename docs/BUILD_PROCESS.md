# Build Process: Expo → Xcode → TestFlight

This document explains the complete build process for FitTrack mobile app, from development to TestFlight distribution.

## Overview

The build process consists of three main stages:

1. **Expo** - Configuration and development
2. **Xcode** - Native build and archive
3. **TestFlight** - Distribution and testing

---

## Stage 1: Expo - Configuration and Development

### What Expo Does

Expo manages:
- App configuration via `app.json` (name, version, bundle ID, permissions, etc.)
- Development environment with hot reload
- JavaScript bundling during development
- Dependency management and Expo SDK modules

### Configuration File: `app.json`

Your `app.json` configures:
- **App metadata**: name, version (1.0.1)
- **Bundle identifier**: `com.fittrack.mobile`
- **Build number**: `2` (iOS)
- **Permissions**: camera, photo library, tracking
- **Assets**: icons, splash screens
- **iOS-specific settings**: supportsTablet, infoPlist entries

### Development Workflow

```bash
cd mobile
npx expo start
```

This:
- Runs Metro bundler (JavaScript bundler)
- Serves JS bundle to Expo Go app or dev client
- Enables hot reload during development
- **No native compilation needed** for development

---

## Stage 2: Prebuild - Generating Native Projects

### What `npx expo prebuild` Does

```bash
cd mobile
npx expo prebuild --platform ios --clean
```

This step:
1. **Reads `app.json`** - Extracts all configuration
2. **Generates native iOS project** - Creates `ios/` directory with:
   - `FitTrack.xcodeproj` (Xcode project file)
   - `FitTrack.xcworkspace` (with CocoaPods integration)
   - `Info.plist` (configured with your settings)
   - Native dependency management (Podfile, CocoaPods)
3. **Installs native dependencies** - Runs `pod install` to install CocoaPods

**Output**: A standard Xcode project you can open and build like any iOS app.

### When to Run Prebuild

Run `npx expo prebuild`:
- ✅ **First time** (already done)
- ✅ **After changing `app.json`** settings (version, permissions, etc.)
- ✅ **After adding native dependencies** that require native code changes
- ❌ **NOT needed** for regular JavaScript code changes

---

## Stage 3: Xcode - Native Build and Archive

### What Xcode Does

Xcode performs:
1. **Compiles native code** (Objective-C/Swift, React Native core)
2. **Links native libraries** (Expo modules, React Native, third-party SDKs)
3. **Bundles JavaScript** (via Expo build scripts that run Metro bundler)
4. **Code signing** (signs app with your Apple Developer certificate)
5. **Creates archive** (`.xcarchive` file ready for distribution)

### Build Process in Xcode

```
1. Open FitTrack.xcworkspace in Xcode
   (IMPORTANT: Use .xcworkspace, NOT .xcodeproj)

2. Select build destination:
   - "Any iOS Device (arm64)" for Archive
   - Or a connected physical device
   - NOT a simulator (can't archive from simulator)

3. Configure Signing:
   - Project Navigator → Select "FitTrack" target
   - "Signing & Capabilities" tab
   - ✅ Check "Automatically manage signing"
   - Select your Development Team
   - Verify Bundle Identifier matches app.json

4. Product → Archive
   - Xcode compiles everything
   - Creates FitTrack.xcarchive
   - Opens Organizer window automatically

5. Distribute App:
   - Click "Distribute App"
   - Select "App Store Connect"
   - Select "Upload"
   - Follow prompts to upload to Apple
```

### Prerequisites

- ✅ **Apple Developer Account** ($99/year)
- ✅ **Development Team** configured in Xcode
- ✅ **Signing Certificate** (automatically managed or manually configured)
- ✅ **Provisioning Profile** (automatically managed or manually configured)

---

## Stage 4: TestFlight - Distribution and Testing

### What TestFlight Does

TestFlight:
1. **Receives archived app** from Xcode upload
2. **Processes and validates** the build (10-30 minutes)
3. **Makes available** to internal/external testers
4. **Provides crash reports** and tester feedback
5. **Manages test groups** and builds

### Upload Process

```
Xcode Organizer
  ↓
Click "Distribute App"
  ↓
Select "App Store Connect"
  ↓
Select "Upload" (not "Export")
  ↓
Review settings and click "Upload"
  ↓
Xcode uploads to Apple's servers
  ↓
Wait 10-30 minutes for processing
  ↓
Check App Store Connect → TestFlight
  ↓
Build appears in TestFlight section
  ↓
Add testers or test internally
```

---

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────┐
│ 1. DEVELOPMENT (Expo)                          │
│    - Write React Native code                    │
│    - Configure in app.json                      │
│    - Test with: npx expo start                  │
│    - Hot reload, fast iteration                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 2. PREBUILD (One-time or when config changes)  │
│    - npx expo prebuild --platform ios           │
│    - Generates native iOS project               │
│    - Creates ios/FitTrack.xcworkspace          │
│    - Installs CocoaPods dependencies            │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 3. BUILD (Xcode)                                │
│    - Open FitTrack.xcworkspace in Xcode       │
│    - Configure signing (Team, certificates)     │
│    - Product → Archive                          │
│    - Compiles native + JavaScript code          │
│    - Creates .xcarchive file                    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 4. DISTRIBUTE (Xcode Organizer)                │
│    - Distribute App → App Store Connect         │
│    - Upload to Apple                            │
│    - Validates build                            │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│ 5. TESTFLIGHT (App Store Connect)              │
│    - Apple processes build (10-30 min)          │
│    - Available for testing                      │
│    - Invite internal/external testers           │
│    - Collect feedback and crash reports         │
└─────────────────────────────────────────────────┘
```

---

## When to Use Each Tool

| Tool | When to Use | Purpose |
|------|-------------|---------|
| **Expo CLI** (`npx expo start`) | Daily development | Start dev server, hot reload, test changes |
| **`expo prebuild`** | First time or config changes | Generate native projects from app.json |
| **Xcode** | Production builds | Build, archive, and sign for distribution |
| **TestFlight** | Testing | Distribute to testers before App Store release |

---

## Quick Reference Commands

### Development
```bash
cd mobile
npx expo start
```

### Prebuild (when needed)
```bash
cd mobile
npx expo prebuild --platform ios --clean
cd ios
export LANG=en_US.UTF-8
pod install
```

### Open in Xcode
```bash
cd mobile
open ios/FitTrack.xcworkspace
```

### Build from Command Line (optional)
```bash
cd mobile/ios
xcodebuild -workspace FitTrack.xcworkspace \
  -scheme FitTrack \
  -configuration Release \
  -archivePath build/FitTrack.xcarchive \
  archive \
  -allowProvisioningUpdates
```

---

## Version Management

### Current Versions (in `app.json`)

- **Version**: 1.0.1 (user-facing version)
- **iOS Build Number**: 2 (increments with each build)
- **Android Version Code**: 2 (increments with each build)

### Bumping Versions

When you want to release a new build:

1. **Update version numbers**:
   - `app.json` → `version`: "1.0.1" → "1.0.2"
   - `app.json` → `ios.buildNumber`: "2" → "3"
   - `app.json` → `android.versionCode`: 2 → 3
   - `package.json` → `version`: "1.0.1" → "1.0.2"

2. **If config changed**, run prebuild:
   ```bash
   npx expo prebuild --platform ios
   ```

3. **Build in Xcode**:
   - Open workspace
   - Product → Archive
   - Distribute to TestFlight

---

## Troubleshooting

### Build Errors

**"Signing requires a development team"**
- Solution: Configure signing in Xcode (Signing & Capabilities tab)

**"No such module 'ExpoModulesCore'"**
- Solution: Run `pod install` in `ios/` directory

**Encoding errors with CocoaPods**
- Solution: `export LANG=en_US.UTF-8` before running `pod install`

**Build number conflicts**
- Solution: Increment build number in `app.json` before building

### Prebuild Issues

**Native project out of sync with app.json**
- Solution: Run `npx expo prebuild --platform ios --clean`

**Missing native dependencies**
- Solution: Ensure `pod install` completed successfully

---

## Key Points

✅ **Development**: Use Expo for fast iteration with hot reload  
✅ **Build**: Use Xcode for production builds and archiving  
✅ **Distribution**: Use TestFlight for beta testing  
✅ **Configuration**: Managed in `app.json`, synced via prebuild  
✅ **No Expo Cloud**: Everything builds locally on your machine  

---

## Next Steps

After TestFlight testing:
1. Fix any issues found by testers
2. Create new build with incremented version
3. Submit for App Store review
4. Release to production

