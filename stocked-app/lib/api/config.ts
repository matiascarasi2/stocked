const DEFAULT_API_URL = "http://10.0.2.2:3000";

export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;
}
