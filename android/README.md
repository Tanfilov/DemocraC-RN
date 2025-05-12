# democra.C Android App

This directory contains the Android version of democra.C, created using Capacitor to wrap the web application.

## Building the App

To build the Android app:

1. Make sure you have Android Studio installed
2. Generate a keystore file (for release builds) using the instructions in `../google_play_assets/keystore_instructions.txt`
3. Place the keystore file in this directory
4. Update the `signing.properties` file with your keystore details
5. Open this directory in Android Studio:

```bash
npx cap open android
```

6. In Android Studio, select Build > Build Bundle(s) / APK(s) > Build Bundle(s)
7. The AAB file will be generated at `app/build/outputs/bundle/release/app-release.aab`

## Testing the App

To test the app on a physical device or emulator:

1. Connect your device via USB or start an emulator
2. In Android Studio, click the "Run" button (green triangle)
3. Select your device from the list

## Updating the App

After making changes to the web application:

1. Rebuild the web app:

```bash
npm run build
```

2. Update the Capacitor project:

```bash
npx cap sync android
```

3. Open in Android Studio to rebuild:

```bash
npx cap open android
```

## Uploading to Google Play

1. Build a release bundle in Android Studio (Build > Build Bundle(s) / APK(s) > Build Bundle(s))
2. Sign in to the Google Play Console: https://play.google.com/console/
3. Create a new app or select your existing app
4. Navigate to Production > Create new release
5. Upload the AAB file
6. Fill in the release notes
7. Submit for review

## App Store Assets

All necessary assets for Google Play Store are located in the `../google_play_assets/` directory, including:
- Screenshots
- Privacy policy
- Store listing information