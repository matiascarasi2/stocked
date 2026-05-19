import type {
  PushTokenListener,
  RemoteMessageListener,
} from "./types";

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function getFcmToken(): Promise<string | null> {
  return null;
}

export function subscribeToPushMessaging(_options: {
  onToken?: PushTokenListener;
  onForegroundMessage?: RemoteMessageListener;
  onNotificationOpened?: RemoteMessageListener;
}): () => void {
  return () => {};
}
