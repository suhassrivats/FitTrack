# OAuth Setup Guide - Google & Apple Sign In

This guide will help you set up Google and Apple Sign In for FitTrack.

## Google Sign In Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Create OAuth Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "iOS" application type
   - Bundle ID: `com.fittrack.mobile`
   - Download the configuration file
4. Select "Android" application type (if supporting Android)
   - Package name: `com.fittrack.mobile`
   - SHA-1 certificate fingerprint (get from Expo)
5. Select "Web application" type
   - Authorized redirect URIs: Add your Expo redirect URI

### 3. Get Your Client IDs

After creating credentials, you'll have:
- iOS Client ID: `YOUR_IOS_CLIENT_ID.apps.googleusercontent.com`
- Android Client ID: `YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com`
- Web Client ID: `YOUR_WEB_CLIENT_ID.apps.googleusercontent.com`

### 4. Update Configuration

#### Mobile App (`mobile/src/hooks/useSocialAuth.js`)
```javascript
const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});
```

#### Backend Environment Variables
Add to your `.env` or deployment environment:
```bash
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

---

## Apple Sign In Setup

### 1. Apple Developer Account Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Select "Identifiers" > Click "+" to create a new App ID

### 2. Configure App ID

1. Select "App IDs" and click "Continue"
2. Select "App" and click "Continue"
3. Configure your App ID:
   - Description: FitTrack
   - Bundle ID: `com.fittrack.mobile`
   - Capabilities: Enable "Sign In with Apple"
4. Click "Continue" and "Register"

### 3. Create Service ID (for web/backend)

1. Go back to "Identifiers" > Click "+"
2. Select "Services IDs" and click "Continue"
3. Configure:
   - Description: FitTrack Web Service
   - Identifier: `com.fittrack.mobile.service`
   - Enable "Sign In with Apple"
4. Configure "Sign In with Apple":
   - Primary App ID: `com.fittrack.mobile`
   - Domains: Add your backend domain
   - Return URLs: Add your backend callback URL
5. Save and continue

### 4. Update App Configuration

#### Mobile App (`mobile/app.json`)
Already configured:
```json
{
  "ios": {
    "usesAppleSignIn": true,
    "bundleIdentifier": "com.fittrack.mobile"
  }
}
```

#### Backend Environment Variables
```bash
APPLE_BUNDLE_ID=com.fittrack.mobile
```

---

## Testing OAuth

### Development Testing

1. **Google Sign In:**
   - Works on both simulators and physical devices
   - Uses development credentials
   - Test with your Google account

2. **Apple Sign In:**
   - Only works on physical iOS devices (iOS 13+)
   - Does not work on simulators
   - Test with your Apple ID

### Production Deployment

1. **Update OAuth URLs:**
   - Update redirect URIs in Google Cloud Console
   - Update return URLs in Apple Developer Portal
   - Point to your production API domain

2. **Environment Variables:**
   - Set `GOOGLE_CLIENT_ID` in production environment
   - Set `APPLE_BUNDLE_ID` in production environment

3. **Build & Deploy:**
   ```bash
   # Mobile app
   cd mobile
   eas build --platform ios
   eas submit --platform ios
   
   # Backend
   # Deploy to your hosting service with environment variables
   ```

---

## Security Notes

1. **Never commit credentials to git:**
   - Add `.env` to `.gitignore`
   - Use environment variables for secrets

2. **Validate tokens server-side:**
   - Always verify OAuth tokens on the backend
   - Don't trust client-provided user data

3. **Use HTTPS:**
   - OAuth requires HTTPS in production
   - Expo dev builds use HTTPS by default

---

## Troubleshooting

### Google Sign In Issues

**Error: "Google Sign In failed"**
- Check that client IDs match your app configuration
- Verify bundle ID matches Google Cloud Console
- Ensure Google+ API is enabled

**Error: "redirect_uri_mismatch"**
- Update authorized redirect URIs in Google Cloud Console
- Use correct Expo redirect URI format

### Apple Sign In Issues

**Error: "Apple Sign In not available"**
- Only works on iOS 13+ physical devices
- Check that `usesAppleSignIn` is set in app.json
- Verify App ID has Sign In with Apple enabled

**Error: "Invalid client"**
- Check bundle ID matches Apple Developer Portal
- Verify Service ID is properly configured
- Ensure domains and return URLs are correct

---

## API Endpoints

### Google Auth
```
POST /api/auth/google
Body: {
  "id_token": "google_id_token"
}
Response: {
  "message": "Authentication successful",
  "user": {...},
  "access_token": "jwt_token"
}
```

### Apple Auth
```
POST /api/auth/apple
Body: {
  "id_token": "apple_id_token",
  "user": {
    "fullName": {
      "givenName": "John",
      "familyName": "Doe"
    }
  }
}
Response: {
  "message": "Authentication successful",
  "user": {...},
  "access_token": "jwt_token"
}
```

---

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)

