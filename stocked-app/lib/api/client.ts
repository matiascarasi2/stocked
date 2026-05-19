import { getApiBaseUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/types";

type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, accessToken } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = extractErrorMessage(data, response.status);
    throw new ApiError(message, response.status);
  }

  return data as T;
}

function extractErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.message === "string") {
      return record.message;
    }
  }

  if (status === 401) {
    return "Invalid email or password";
  }

  if (status === 409) {
    return "Email already registered";
  }

  return "Something went wrong. Please try again.";
}
