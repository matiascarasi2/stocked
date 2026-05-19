import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import { getAccessToken } from "@/lib/auth/storage";

type AuthenticatedRequestOptions = {
  method?: string;
  body?: unknown;
};

export async function authenticatedRequest<T>(
  path: string,
  options: AuthenticatedRequestOptions = {},
): Promise<T> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new ApiError("Unauthorized", 401);
  }

  return apiRequest<T>(path, { ...options, accessToken });
}
