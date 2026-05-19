import { describe, expect, it } from "@jest/globals";
import { ValidationError } from "./users.errors.js";
import {
  parseRefreshBody,
  parseRegisterSignInBody,
} from "./users.validation.js";

describe("parseRegisterSignInBody", () => {
  it("parses valid input and normalizes email", () => {
    const result = parseRegisterSignInBody({
      email: "User@Example.com",
      password: "password1",
      platform: "android",
      deviceId: "device-1",
      pushToken: "fcm-token",
    });

    expect(result).toEqual({
      email: "user@example.com",
      password: "password1",
      platform: "android",
      deviceId: "device-1",
      pushToken: "fcm-token",
    });
  });

  it("rejects invalid email", () => {
    expect(() =>
      parseRegisterSignInBody({
        email: "not-an-email",
        password: "password1",
        platform: "android",
      }),
    ).toThrow(ValidationError);
  });

  it("rejects short password", () => {
    expect(() =>
      parseRegisterSignInBody({
        email: "user@example.com",
        password: "short",
        platform: "android",
      }),
    ).toThrow(ValidationError);
  });

  it("rejects missing platform", () => {
    expect(() =>
      parseRegisterSignInBody({
        email: "user@example.com",
        password: "password1",
        platform: "   ",
      }),
    ).toThrow(ValidationError);
  });

  it("rejects invalid deviceId type", () => {
    expect(() =>
      parseRegisterSignInBody({
        email: "user@example.com",
        password: "password1",
        platform: "android",
        deviceId: 123,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects invalid pushToken type", () => {
    expect(() =>
      parseRegisterSignInBody({
        email: "user@example.com",
        password: "password1",
        platform: "android",
        pushToken: 123,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects non-object body", () => {
    expect(() => parseRegisterSignInBody(null)).toThrow(ValidationError);
  });
});

describe("parseRefreshBody", () => {
  it("parses valid refresh token", () => {
    expect(parseRefreshBody({ refreshToken: "token-abc" })).toEqual({
      refreshToken: "token-abc",
    });
  });

  it("rejects empty refresh token", () => {
    expect(() => parseRefreshBody({ refreshToken: "" })).toThrow(
      ValidationError,
    );
  });

  it("rejects non-object body", () => {
    expect(() => parseRefreshBody(undefined)).toThrow(ValidationError);
  });
});
