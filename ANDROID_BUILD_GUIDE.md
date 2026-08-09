# Study & Productivity Tracker - Android Native App Build Guide

This document provides complete, production-ready instructions for compiling, testing, and generating standalone **Android APKs** (`.apk`) and **Android App Bundles** (`.aab`) from this React + Vite web application using **Capacitor**.

---

## 📱 App Overview & Architecture

- **Core Engine:** React 18 with Vite and TypeScript.
- **Native Wrapper:** Capacitor (`@capacitor/android`) converts the single-page application into a high-performance native Android WebView app wrapper.
- **Offline Reliability:** All data (syllabuses, study logs, task matrices, habits, and exam trackers) is stored completely offline in the web-view database wrapper (`localStorage`), which is fully persistent on Android.
- **Native Android Features:**
  - **Local Notifications:** Automated push notifications at the end of Pomodoro work or break cycles.
  - **System Share Sheet:** Share raw database JSON backups directly with Google Drive, email clients, notes apps, etc.
  - **Styled Status Bar:** System status bar color matches the deep slate `#0f172a` aesthetic.
  - **Splash Screen:** Auto-managed, high-resolution splash image hiding upon React initialization.

---

## 🛠️ Prerequisites

To compile the project on your local machine, ensure you have:

1. **Node.js** (v18 or higher) & **npm**.
2. **Android Studio** (Koala, Ladybug, or higher) with:
   - **Android SDK** (API level 34+ recommended).
   - **Android SDK Command-line Tools**.
   - **Android Emulator** (optional, if testing without a physical phone).
3. **Java Development Kit (JDK) 17** (required by Gradle). Ensure `JAVA_HOME` is set in your environment.

---

## 🚀 One-Step Setup & Synchronize Script

We have bundled a single bash script that automates the whole process:
- Compiles the React + Vite production build into `/dist`.
- Syncs the static files and linked plugins into the `/android` project directory.

Run this script from the workspace root:

```bash
./setup-capacitor.sh
```

*(Alternatively, you can run the individual NPM scripts defined in `package.json`)*:

```bash
# 1. Compile React Web Assets
npm run build

# 2. Synchronize assets and Capacitor plugins with Android
npm run cap:sync
```

---

## 🏗️ Generating the APK & AAB

Follow these steps on your local machine to build your APK:

### Step 1: Open the Project in Android Studio
Use the Capacitor CLI to open the native project directly inside Android Studio:

```bash
npx cap open android
```

### Step 2: Build a Debug APK (For Testing)
Inside Android Studio:
1. Wait for the Gradle sync to finish successfully (indicated by a green checkmark).
2. In the top menu, go to **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
3. Android Studio will compile the code. Once done, a popup will appear at the bottom right. Click **Locate**.
4. Your compiled APK will be at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

*You can copy this `.apk` directly to any Android phone, install it, and run it 100% offline!*

### Step 3: Run Directly on an Emulator or Device
1. Connect your physical Android phone with **USB Debugging** enabled, or start an Android Emulator in Android Studio.
2. Click the green **Run** button (Play icon) in the Android Studio toolbar, or run:
   ```bash
   npx cap run android
   ```

---

## 🔒 Production Release & Google Play Signing

To build a secure, obfuscated, and signed APK/AAB for distribution or Google Play Store:

1. Inside Android Studio, go to **Build** -> **Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** (preferred for Play Store) or **APK** (for direct download) and click **Next**.
3. Create or select a secure **Keystore** file (`.jks`) and enter your passwords.
4. Set the build variant to **release**.
5. Enable **V1 (Jar Signature)** and **V2 (Full APK Signature)** if building an APK.
6. Click **Finish**.
7. The production bundle/APK will be generated under:
   `android/app/release/`

---

## ⚙️ App Configuration Details

### Android Permissions (`AndroidManifest.xml`)
The app utilizes native push notifications for Pomodoro and breaks. The required permission is declared in `/android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### Main Configurations (`capacitor.config.ts`)
The package names and configurations are defined inside the config file:
- **App ID:** `com.studytracker.app`
- **App Name:** `Study & Productivity Tracker`
- **Web Directory:** `dist`
- **Native Scheme:** `https` (resolves WebView CORS issues)
