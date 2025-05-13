# Codemagic.io Setup Guide for democra.C

This guide will help you set up your democra.C project on GitHub and configure Codemagic.io to build your Android app.

## 1. Setting Up GitHub Repository

First, you'll need to push your code to the GitHub repository:

```bash
# Initialize a new repository (if you haven't already)
git init

# Add all files to the repository
git add .

# Commit the changes
git commit -m "Initial commit for democra.C app"

# Add the remote repository
git remote add origin https://github.com/Tanfilov/DemocraC-RN.git

# Push to GitHub (you may need to authenticate with GitHub)
git push -u origin main
```

## 2. Setting Up Codemagic.io

### 2.1 Create a Codemagic Account

If you don't already have one, sign up for a Codemagic account at [https://codemagic.io/signup](https://codemagic.io/signup).

### 2.2 Add Your Project

1. Log in to Codemagic.io
2. Click on "Add application"
3. Select GitHub as your repository provider
4. Authorize Codemagic to access your GitHub repositories
5. Find and select the "DemocraC-RN" repository

### 2.3 Configure Your Build

#### Basic Configuration

Create a `codemagic.yaml` file in the root of your project with the following content:

```yaml
workflows:
  android-workflow:
    name: Android Workflow
    instance_type: mac_mini_m1
    max_build_duration: 60
    environment:
      node: latest
      npm: latest
    scripts:
      - name: Install dependencies
        script: |
          cd DemocraC_RN
          npm install
      - name: Build Android app
        script: |
          cd DemocraC_RN
          npx expo prebuild --platform android
          cd android
          ./gradlew assembleRelease
    artifacts:
      - android/app/build/outputs/apk/release/*.apk
      - android/app/build/outputs/bundle/release/app-release.aab
```

### 2.4 Configure Android Signing

For a release build, you'll need to configure signing for your Android app:

1. In Codemagic.io, go to "Teams" and select your team
2. Navigate to "Settings" > "Variables"
3. Add the following environment variables:
   - `CM_KEYSTORE_PATH`: Path to your keystore file
   - `CM_KEYSTORE_PASSWORD`: Your keystore password
   - `CM_KEY_ALIAS`: Key alias
   - `CM_KEY_PASSWORD`: Key password

4. Upload your keystore file in the "Code signing identities" section

#### Generating a Keystore (if you don't have one)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore democrac-release-key.keystore -alias democrac-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

## 3. Required Files for Codemagic.io

Make sure you have the following files in your project:

### 3.1 Android Gradle Configuration

In `android/app/build.gradle`, make sure you have signing configuration:

```gradle
android {
    // ... other configurations

    signingConfigs {
        release {
            if (System.getenv("CM_KEYSTORE_PATH")) {
                storeFile file(System.getenv("CM_KEYSTORE_PATH"))
                storePassword System.getenv("CM_KEYSTORE_PASSWORD")
                keyAlias System.getenv("CM_KEY_ALIAS")
                keyPassword System.getenv("CM_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... other release configurations
        }
    }
}
```

### 3.2 App Configuration

Make sure your `app.json` in the DemocraC_RN directory has appropriate configuration:

```json
{
  "expo": {
    "name": "democra.C",
    "slug": "democrac",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.democrac.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## 4. Testing Your Build

Once you've set up everything:

1. Commit and push your changes to GitHub
2. Go to your project on Codemagic.io
3. Start a new build
4. Monitor the build logs for any errors
5. If the build is successful, download the APK or AAB file

## 5. Troubleshooting Common Issues

### 5.1 Java Version Issues

If you encounter Java version issues in your build, make sure to specify the Java version in your `codemagic.yaml`:

```yaml
environment:
  java: 11
```

### 5.2 Gradle Issues

For Gradle issues, ensure your `gradle-wrapper.properties` file specifies a compatible Gradle version:

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-7.5.1-all.zip
```

### 5.3 Memory Issues

If you encounter memory-related issues during the build, you can increase the memory for Gradle in `android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=4096m -XX:+HeapDumpOnOutOfMemoryError
```

## 6. Publishing to Google Play

Once you have a successful build, you can configure Codemagic to automatically publish your app to Google Play:

1. Set up a Google Play API service account and download the JSON key file
2. Add the key to Codemagic variables as `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`
3. Add Google Play publishing configuration to your `codemagic.yaml`

```yaml
publishing:
  google_play:
    credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
    track: internal
    submit_as_draft: true
```

## 7. Tips for Optimizing the Build Process

- Cache your dependencies to speed up subsequent builds
- Use a specific Node.js version for consistency
- Optimize your app size by removing unused assets
- Configure proper error reporting to identify issues quickly

## 8. Resources

- [Codemagic Documentation](https://docs.codemagic.io/)
- [React Native Android Build Guide](https://docs.codemagic.io/yaml-quick-start/building-a-react-native-app/)
- [Android Signing Guide](https://docs.codemagic.io/code-signing-yaml/signing-android/)