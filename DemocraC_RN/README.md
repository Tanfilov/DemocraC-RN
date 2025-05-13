# democra.C React Native WebView App

This is a React Native wrapper application for the democra.C web app. It uses WebView to display the web application within a native Android container.

## Features

- Full native Android app experience
- RTL support for Hebrew text
- Custom splash screen with democra.C branding
- Advanced caching prevention for fresh content
- Android back button navigation support
- Error handling and offline mode
- Hardware acceleration for smooth scrolling

## Prerequisites

- Node.js and npm
- Expo CLI
- Android Studio (for Android builds)
- Expo account (for cloud builds)

## Getting Started

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Use the Expo Go app on your device to scan the QR code and preview the app

## Building for Production

### Option 1: Using Expo EAS Build (Recommended)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Log in to your Expo account:
   ```bash
   eas login
   ```

3. Configure your build:
   ```bash
   eas build:configure
   ```

4. Update the `app.json` file with your own Expo project ID (you'll get this after creating a project on Expo's website)

5. Start the build process:
   ```bash
   eas build --platform android
   ```

6. Once the build is complete, you can download the APK/AAB from the Expo website

### Option 2: Building Locally

1. Install the Expo build tools:
   ```bash
   npx expo install expo-dev-client
   ```

2. Create a development build:
   ```bash
   npx expo prebuild
   ```

3. Open the Android project in Android Studio:
   ```bash
   cd android
   ```

4. Build using Android Studio or Gradle:
   ```bash
   ./gradlew assembleRelease
   ```

5. Find the APK in `android/app/build/outputs/apk/release/`

## Signing the APK

1. Generate a keystore file:
   ```bash
   keytool -genkey -v -keystore democrac.keystore -alias democrac -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Create or update the `android/app/build.gradle` file with your signing configuration

3. Build a signed APK:
   ```bash
   ./gradlew assembleRelease
   ```

## Publishing to Google Play

1. Create a developer account on Google Play Console
2. Create a new application
3. Upload your AAB/APK file
4. Fill in all required information including:
   - App description
   - Screenshots
   - Privacy policy
   - Content rating
5. Submit for review

## Additional Information

- The app is currently configured to access the web application at: `https://democrac.repl.co/`
- To change this URL, update the `WEB_APP_URL` constant in `App.tsx`
- For better performance, consider hosting your web app on a production service

## Troubleshooting

- If you encounter WebView loading issues, check your internet connection and the URL configuration
- For build errors, ensure you have the latest version of Expo and related packages
- If you face Google Play submission issues, verify your app meets all their guidelines