# democra.C Android App Deployment Guide

This guide provides detailed instructions for building and deploying the democra.C Android app using the React Native WebView wrapper.

## Prerequisites

1. Install the required tools:
   - [Node.js](https://nodejs.org/) (v16 or newer)
   - [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
   - [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`)
   - An [Expo account](https://expo.dev/signup)

## Option 1: Building with Expo EAS (Recommended)

This method is simpler and doesn't require Android Studio or Java setup.

### Step 1: Set up your project

1. Install all dependencies:
   ```bash
   cd DemocraC_RN
   npm install
   ```

2. Login to your Expo account:
   ```bash
   eas login
   ```

3. Initialize EAS Build:
   ```bash
   eas build:configure
   ```

### Step 2: Update your app configuration

1. Edit `app.json` to set your own Expo project ID
2. Ensure URLs are correctly pointing to your hosted democra.C web app
3. Customize app metadata (name, version, package name, etc.)

### Step 3: Start the build process

1. Build an APK for testing:
   ```bash
   eas build --platform android --profile preview
   ```

2. Build a production AAB file for Google Play:
   ```bash
   eas build --platform android --profile production
   ```

3. Follow the prompts to set up keystore management (let EAS handle it unless you have specific requirements)

4. Once complete, download your APK/AAB from the Expo dashboard

## Option 2: Building Locally with Expo

This approach creates a basic Expo development build that you can run on your device.

1. Generate a development build:
   ```bash
   cd DemocraC_RN
   npx expo run:android
   ```

2. This will create a debug APK that you can install on your device for testing

## Option 3: Building with Android Studio

If you prefer more control and have experience with Android development:

1. Create a bare workflow project:
   ```bash
   cd DemocraC_RN
   npx expo prebuild
   ```

2. Open the Android project in Android Studio:
   ```bash
   cd android
   ```

3. Follow the standard Android build process from there

## Signing the App

When building for Google Play, you need to sign your app:

1. If using EAS Build, it will handle signing automatically
2. If building locally, follow the Android [app signing process](https://developer.android.com/studio/publish/app-signing)

## Google Play Submission

1. Create a Google Play Developer account (requires one-time $25 fee)
2. Create a new application in the Google Play Console
3. Upload your AAB/APK file to Google Play
4. Fill in the required information:
   - App description: "democra.C provides the latest news with politician ratings"
   - Privacy policy: Use the content from `google_play_assets/privacy_policy.html`
   - Screenshots: Capture from your app
   - Content rating: Complete the questionnaire
5. Submit for review

## App URL Configuration

The app is currently configured to load the web app from:
```
https://democrac.repl.co/
```

If your web app is hosted elsewhere, update the `WEB_APP_URL` constant in `App.tsx`.

## Troubleshooting Common Issues

### Issue: WebView shows blank screen
Solution: Ensure your web app URL is accessible and HTTPS-enabled

### Issue: App crashes on startup
Solution: Check for any unhandled exceptions in the WebView integration

### Issue: Google Play rejects the app
Solution: Ensure all metadata is complete and you've addressed any policy violations

### Issue: News not refreshing
Solution: Verify the refresh implementation in `WebViewIntegration.ts` matches your web app's refresh mechanism

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [React Native WebView Documentation](https://github.com/react-native-webview/react-native-webview)

For any issues not covered here, refer to the official documentation or reach out to the development team.