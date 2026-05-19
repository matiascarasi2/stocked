import { ValidationError } from "./users.errors.js";

export type RegisterSignInInput = {
  email: string;
  password: string;
  platform: string;
  deviceId?: string;
  pushToken?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseRegisterSignInBody(body: unknown): RegisterSignInInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body");
  }

  const { email, password, platform, deviceId, pushToken } = body as Record<
    string,
    unknown
  >;

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    throw new ValidationError("A valid email is required");
  }

  if (typeof password !== "string" || password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  if (typeof platform !== "string" || platform.trim().length === 0) {
    throw new ValidationError("Platform is required");
  }

  if (deviceId !== undefined && typeof deviceId !== "string") {
    throw new ValidationError("deviceId must be a string");
  }

  if (pushToken !== undefined && typeof pushToken !== "string") {
    throw new ValidationError("pushToken must be a string");
  }

  return {
    email: email.trim().toLowerCase(),
    password,
    platform: platform.trim(),
    deviceId,
    pushToken,
  };
}

export function parseRefreshBody(body: unknown): { refreshToken: string } {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body");
  }

  const { refreshToken } = body as Record<string, unknown>;

  if (typeof refreshToken !== "string" || refreshToken.length === 0) {
    throw new ValidationError("refreshToken is required");
  }

  return { refreshToken };
}
