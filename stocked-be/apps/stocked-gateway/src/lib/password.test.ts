import { describe, expect, it } from "@jest/globals";
import { hashPassword, verifyPassword } from "./password.js";

describe("password", () => {
  it("verifyPassword returns true for matching hash", async () => {
    const password = "password123";
    const hash = await hashPassword(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it("verifyPassword returns false for non-matching password", async () => {
    const hash = await hashPassword("password123");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});
