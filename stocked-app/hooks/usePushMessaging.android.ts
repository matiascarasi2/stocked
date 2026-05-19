import { useEffect } from "react";

import { parsePriceAlertMessage } from "@/lib/push/parse-alert-message";
import {
  getFcmToken,
  requestNotificationPermission,
  subscribeToPushMessaging,
} from "@/lib/push/messaging";
import { showToast } from "@/lib/toast";

export function usePushMessaging(): void {
  useEffect(() => {
    let unsubscribe = () => {};

    const setup = async () => {
      const granted = await requestNotificationPermission();
      if (!granted && __DEV__) {
        console.warn("[FCM] Notification permission not granted");
      }

      unsubscribe = subscribeToPushMessaging({
        onToken: (token) => {
          if (__DEV__) {
            console.log("[FCM] Token:", token);
          }
        },
        onForegroundMessage: (message) => {
          const content = parsePriceAlertMessage(message);
          if (content) {
            showToast(content);
          }
          if (__DEV__) {
            console.log("[FCM] Foreground message:", message.messageId);
          }
        },
        onNotificationOpened: (message) => {
          if (__DEV__) {
            console.log("[FCM] Opened from notification:", message.messageId);
          }
        },
      });

      await getFcmToken();
    };

    void setup();

    return () => {
      unsubscribe();
    };
  }, []);
}
