import { apiRequest } from "@/lib/api/client";
import type {
  AuthTokensResponse,
  RefreshTokensResponse,
  RegisterSignInBody,
} from "@/lib/api/types";

export function register(body: RegisterSignInBody): Promise<AuthTokensResponse> {
  return apiRequest<AuthTokensResponse>("/users/register", {
    method: "POST",
    body,
  });
}

export function signIn(body: RegisterSignInBody): Promise<AuthTokensResponse> {
  return apiRequest<AuthTokensResponse>("/users/sign-in", {
    method: "POST",
    body,
  });
}

export function refresh(refreshToken: string): Promise<RefreshTokensResponse> {
  return apiRequest<RefreshTokensResponse>("/users/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}

export function logout(accessToken: string): Promise<void> {
  return apiRequest<void>("/users/logout", {
    method: "POST",
    accessToken,
  });
}
