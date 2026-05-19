import type { RemoteMessage } from "./types";

export async function handleBackgroundMessage(
  _remoteMessage: RemoteMessage,
): Promise<void> {
  // No-op on non-Android platforms.
}
