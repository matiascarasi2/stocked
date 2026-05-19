import * as SecureStore from "expo-secure-store";

import type { AuthUser } from "@/lib/api/types";

const KEYS = {
  accessToken: "auth.accessToken",
  refreshToken: "auth.refreshToken",
  deviceId: "auth.deviceId",
  user: "auth.user",
} as const;

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.refreshToken);
}

export async function getDeviceId(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.deviceId);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await SecureStore.getItemAsync(KEYS.user);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (
      typeof parsed.id === "string" &&
      parsed.id.length > 0 &&
      typeof parsed.email === "string" &&
      parsed.email.length > 0
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveSession(params: {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  user: AuthUser;
}): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.accessToken, params.accessToken),
    SecureStore.setItemAsync(KEYS.refreshToken, params.refreshToken),
    SecureStore.setItemAsync(KEYS.deviceId, params.deviceId),
    SecureStore.setItemAsync(KEYS.user, JSON.stringify(params.user)),
  ]);
}

export async function saveTokens(params: {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
}): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(KEYS.accessToken, params.accessToken),
    SecureStore.setItemAsync(KEYS.refreshToken, params.refreshToken),
    SecureStore.setItemAsync(KEYS.deviceId, params.deviceId),
  ]);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.accessToken),
    SecureStore.deleteItemAsync(KEYS.refreshToken),
    SecureStore.deleteItemAsync(KEYS.deviceId),
    SecureStore.deleteItemAsync(KEYS.user),
  ]);
}
