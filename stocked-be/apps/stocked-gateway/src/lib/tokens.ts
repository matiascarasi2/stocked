import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { env } from "./env.js";

export type AccessTokenPayload = {
  sub: string;
  deviceId: string;
  sessionId: string;
  tv: number;
};

const encoder = new TextEncoder();
const secretKey = () => encoder.encode(env.jwtAccessSecret);

export function createRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(refreshToken: string): string {
  return createHash("sha256").update(refreshToken).digest("hex");
}

export function refreshTokenExpiresAt(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenTtlDays);
  return expiresAt;
}

export async function signAccessToken(
  payload: AccessTokenPayload,
): Promise<string> {
  return new SignJWT({
    deviceId: payload.deviceId,
    sessionId: payload.sessionId,
    tv: payload.tv,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${env.jwtAccessTtlSeconds}s`)
    .sign(secretKey());
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, secretKey());
  const sub = payload.sub;
  const deviceId = payload.deviceId;
  const sessionId = payload.sessionId;
  const tv = payload.tv;

  if (
    typeof sub !== "string" ||
    typeof deviceId !== "string" ||
    typeof sessionId !== "string" ||
    typeof tv !== "number"
  ) {
    throw new Error("Invalid access token payload");
  }

  return { sub, deviceId, sessionId, tv };
}
