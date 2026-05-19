import type { RemoteMessage } from "./types";

export async function handleBackgroundMessage(
  remoteMessage: RemoteMessage,
): Promise<void> {
  if (__DEV__) {
    console.log("[FCM] Background message:", remoteMessage.messageId);
  }
}
