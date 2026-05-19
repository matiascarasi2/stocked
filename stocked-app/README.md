# stocked-app

Android-only Expo app for [stocked](../README.md). Push notifications use Firebase Cloud Messaging via `@react-native-firebase/messaging`.

**Expo Go is not supported** — native Firebase modules require a [development build](https://docs.expo.dev/develop/development-builds/introduction/).

## Prerequisites

- Node.js and npm
- [Android Studio](https://docs.expo.dev/workflow/android-studio-emulator/) (emulator or USB device)
- A Firebase project with an Android app registered as **`com.stocked.app`**

## Firebase setup

1. Open [Firebase Console](https://console.firebase.google.com/) and create or select a project.
2. Add an **Android** app with package name `com.stocked.app`.
3. Download `google-services.json` and place it at `stocked-app/google-services.json` (see `google-services.json.example` for the expected shape).
4. Ensure **Cloud Messaging** is enabled for the project.

## Install and run

```bash
cd stocked-app
npm install
npm run prebuild:android
npm run run:android
```

For day-to-day JS development after the first native build:

```bash
npm start
```

Then open the existing development build on your emulator or device (not Expo Go).

If you previously installed a build without Firebase, uninstall it from the device before `npm run run:android`.

## Testing push notifications

1. Run the app on an Android emulator or device.
2. In Metro logs, find `[FCM] Token: …` (dev builds only).
3. In Firebase Console → **Engage** → **Messaging**, send a test message to that token.

### Verification checklist

- App launches on Android (development build, not Expo Go).
- FCM registration token appears in logs.
- **Foreground:** test message → `[FCM] Foreground message:` in logs.
- **Background:** notification payload → system tray + `[FCM] Background message:` in logs.
- **Quit:** high-priority data-only message → background handler log (data-only needs `android.priority: high` on the server).
- **API 33+:** notification permission prompt on first launch.

## Project structure (push)

| Path | Purpose |
|------|---------|
| `index.js` | Registers `setBackgroundMessageHandler` before expo-router (Headless JS on Android). |
| `lib/push/messaging.android.ts` | Permissions, token, foreground and notification-open listeners. |
| `lib/push/backgroundHandler.android.ts` | Background/quit message handler. |
| `hooks/usePushMessaging.android.ts` | React hook wired in `app/_layout.tsx`. |

Non-Android platforms use no-op stubs (`*.ts`) so Metro and TypeScript stay compatible if web tooling is used.

## Follow-up

Register the FCM token with the backend `Device.pushToken` field once the API client exists.
