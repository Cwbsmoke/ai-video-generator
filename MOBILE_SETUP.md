# AI Video Generator - Mobile APK Setup Guide

This guide will help you convert the AI Video Generator web app to a native Android APK.

## Prerequisites

1. **Node.js** (v16+) and npm/yarn
2. **Python** 3.8+ (for backend)
3. **Java Development Kit (JDK)** 11+ (for Android build)
4. **Android SDK** (via Android Studio recommended)
5. **EAS CLI** account (free)

## Step 1: Install Required Tools

### 1.1 Install EAS CLI
```bash
npm install -g eas-cli
```

### 1.2 Login to EAS
```bash
eas login
# Create a free account at https://expo.dev if you don't have one
```

### 1.3 Install Android SDK
Download and install [Android Studio](https://developer.android.com/studio)

Set up Android environment variables:
```bash
# On macOS/Linux, add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools

# On Windows, set via System Environment Variables:
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\sdk
```

## Step 2: Set Up Mobile Project

### 2.1 Navigate to Mobile Directory
```bash
cd mobile
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Configure Backend URL

Edit `App.js` and update the `BACKEND_URL`:

```javascript
const BACKEND_URL = 'http://your-backend-server.com'; // Change to your backend
```

If testing locally:
- Android Emulator: `http://10.0.2.2:8001`
- Physical device on same network: `http://192.168.x.x:8001`

## Step 3: Test Locally

### Option A: Using Expo Go (Quick Testing)
```bash
npm start

# Scan QR code with Expo Go app on your phone
```

### Option B: Using Android Emulator
```bash
npm run android
```

## Step 4: Build APK for Production

### 4.1 Create EAS Configuration
```bash
eas build:configure
```

Select "Android" when prompted.

### 4.2 Build APK Locally (Recommended for first-time)
```bash
npm run build-apk
```

Or build via EAS cloud:
```bash
eas build --platform android --profile preview
```

The APK will be generated and a download link provided.

### 4.3 Download and Install
- Download the APK file
- Transfer to Android device
- Enable "Unknown Sources" in Settings > Security
- Open APK file and tap "Install"

## Step 5: Advanced Configuration (Optional)

### 5.1 Customize App Icon
Replace `assets/adaptive-icon.png` with your custom icon (1080x1080px)

### 5.2 Customize App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### 5.3 Add Splash Screen
Create `assets/splash.png` (1242x2436px)

### 5.4 Release to Google Play Store

Create release APK:
```bash
eas build --platform android --profile release
```

Then submit:
```bash
npm run submit-apk
```

Or manually upload to Google Play Console.

## Step 6: Troubleshooting

### Issue: "Backend connection refused"
- Ensure backend is running: `cd backend && uvicorn server:app --host 0.0.0.0 --port 8001`
- For Android Emulator, use: `http://10.0.2.2:8001`
- For Physical device, use: `http://YOUR_COMPUTER_IP:8001`

### Issue: "Permission Denied"
- Go to Android Settings > Apps > AI Video Generator > Permissions
- Enable Camera and Storage permissions

### Issue: "Build Failed"
- Clear cache: `eas build:cancel` then try again
- Update dependencies: `npm update`
- Check Java version: `java -version` (should be 11+)

### Issue: "Image Pick Not Working"
- Ensure permissions are granted in app settings
- Test with a different image format (JPG, PNG)

## Step 7: Development Workflow

### To make changes:
1. Edit files in `mobile/` directory
2. Save changes
3. Hot reload: Press 'r' in Expo CLI terminal
4. Or rebuild: `npm run android` or `npm start`

### To update backend connectivity:
1. Edit `BACKEND_URL` in `App.js`
2. Rebuild: `npm run build-apk`

## Step 8: Monetization & Distribution

### Google Play Store
1. Create a Google Play Developer account ($25 one-time)
2. Create an app listing
3. Upload signed APK/AAB
4. Submit for review
5. Go live!

### Amazon Appstore
Alternative distribution channel with lower requirements.

## Step 9: Continuous Updates

To release updates:

```bash
# Increment version
npm version patch

# Rebuild
npm run build-apk

# Submit new version
npm run submit-apk
```

## Useful Commands

```bash
# Start development
npm start

# Build for Android emulator
npm run android

# Build APK locally
npm run build-apk

# Build with EAS
eas build --platform android

# View logs
eas build:view

# Submit to Play Store
npm run submit-apk
```

## Important Notes

1. **Permissions**: The app requests Camera and Storage permissions on first launch
2. **Backend**: Make sure your FastAPI backend is accessible from the mobile device
3. **Network**: Test on both WiFi and cellular networks
4. **File Size**: The APK will be ~50-100 MB depending on dependencies

## Next Steps

1. Start the backend server
2. Test locally with Expo Go
3. Build APK for Android
4. Install on device
5. Submit to Google Play Store when ready

---

For more info, visit:
- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [EAS Build](https://docs.expo.dev/build/introduction/)
