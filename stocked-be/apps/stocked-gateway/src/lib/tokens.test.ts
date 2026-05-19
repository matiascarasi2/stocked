import { describe, expect, it } from "@jest/globals";
import {
  createRefreshToken,
  hashRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from "./tokens.js";

describe("tokens", () => {
  it("hashRefreshToken is deterministic", () => {
    const token = "my-refresh-token";
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
  });

  it("createRefreshToken produces distinct values", () => {
    const a = createRefreshToken();
    const b = createRefreshToken();
    expect(a).not.toBe(b);
  });

  it("signAccessToken and verifyAccessToken round-trip", async () => {
    const payload = {
      sub: "user-1",
      deviceId: "device-1",
      sessionId: "session-1",
      tv: 0,
    };

    const token = await signAccessToken(payload);
    const verified = await verifyAccessToken(token);

    expect(verified).toEqual(payload);
  });
});
