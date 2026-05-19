import { Platform } from "react-native";

import { getFcmToken } from "@/lib/push/messaging";
import { getDeviceId } from "@/lib/auth/storage";

export async function getAuthDevicePayload(): Promise<{
  platform: string;
  deviceId?: string;
  pushToken?: string;
}> {
  const deviceId = await getDeviceId();
  const pushToken = Platform.OS === "android" ? await getFcmToken() : null;

  return {
    platform: "android",
    ...(deviceId ? { deviceId } : {}),
    ...(pushToken ? { pushToken } : {}),
  };
}
