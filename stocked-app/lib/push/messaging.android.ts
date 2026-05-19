import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

import type {
  PushTokenListener,
  RemoteMessage,
  RemoteMessageListener,
} from "./types";

export async function requestNotificationPermission(): Promise<boolean> {
  if (Number(Platform.Version) >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

export async function getFcmToken(): Promise<string | null> {
  await messaging().setAutoInitEnabled(true);
  const token = await messaging().getToken();
  return token || null;
}

export function subscribeToPushMessaging(options: {
  onToken?: PushTokenListener;
  onForegroundMessage?: RemoteMessageListener;
  onNotificationOpened?: RemoteMessageListener;
}): () => void {
  const unsubscribers: (() => void)[] = [];

  if (options.onToken) {
    void getFcmToken().then((token) => {
      if (token) {
        options.onToken?.(token);
      }
    });

    unsubscribers.push(
      messaging().onTokenRefresh((token) => {
        options.onToken?.(token);
      }),
    );
  }

  if (options.onForegroundMessage) {
    unsubscribers.push(
      messaging().onMessage((message) => {
        options.onForegroundMessage?.(message);
      }),
    );
  }

  if (options.onNotificationOpened) {
    unsubscribers.push(
      messaging().onNotificationOpenedApp((message) => {
        options.onNotificationOpened?.(message);
      }),
    );

    void messaging()
      .getInitialNotification()
      .then((message) => {
        if (message) {
          options.onNotificationOpened?.(message);
        }
      });
  }

  return () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
  };
}

export type { RemoteMessage };
