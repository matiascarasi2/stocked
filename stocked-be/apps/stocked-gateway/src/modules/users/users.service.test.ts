import { describe, expect, it, jest } from "@jest/globals";
import { hashPassword } from "../../lib/password.js";
import { hashRefreshToken } from "../../lib/tokens.js";
import { ConflictError, UnauthorizedError } from "./users.errors.js";
import type { UsersRepository } from "./users.repository.js";
import { UsersService } from "./users.service.js";

const now = new Date("2026-01-01T00:00:00.000Z");

const userFixture = {
  id: "user-1",
  email: "user@example.com",
  passwordHash: "hashed-password",
  tokenVersion: 0,
  createdAt: now,
  updatedAt: now,
};

const deviceFixture = {
  id: "device-1",
  userId: "user-1",
  platform: "android",
  pushToken: null,
  createdAt: now,
  lastSeenAt: now,
};

const sessionFixture = {
  id: "session-1",
  userId: "user-1",
  deviceId: "device-1",
  refreshTokenHash: "hash",
  expiresAt: new Date("2026-02-01T00:00:00.000Z"),
  createdAt: now,
  revokedAt: null,
};

function createMockRepository(
  overrides: Partial<jest.Mocked<UsersRepository>> = {},
): jest.Mocked<UsersRepository> {
  return {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    findDeviceForUser: jest.fn(),
    createDevice: jest.fn(),
    updateDevice: jest.fn(),
    revokeSessionsForDevice: jest.fn(),
    createSession: jest.fn(),
    findActiveSessionByRefreshHash: jest.fn(),
    rotateSessionRefreshToken: jest.fn(),
    deleteDevice: jest.fn(),
    ...overrides,
  };
}

describe("UsersService", () => {
  const validInput = {
    email: "user@example.com",
    password: "password1",
    platform: "android",
  };

  describe("register", () => {
    it("throws ConflictError when email exists", async () => {
      const repository = createMockRepository({
        findUserByEmail: jest.fn().mockResolvedValue(userFixture),
      });
      const service = new UsersService(repository);

      await expect(service.register(validInput)).rejects.toThrow(ConflictError);
    });

    it("creates user, device, session and returns tokens", async () => {
      const repository = createMockRepository({
        findUserByEmail: jest.fn().mockResolvedValue(null),
        createUser: jest.fn().mockResolvedValue(userFixture),
        createDevice: jest.fn().mockResolvedValue(deviceFixture),
        revokeSessionsForDevice: jest.fn().mockResolvedValue(undefined),
        createSession: jest.fn().mockResolvedValue(sessionFixture),
      });
      const service = new UsersService(repository);

      const result = await service.register(validInput);

      expect(repository.createUser).toHaveBeenCalledWith(
        validInput.email,
        expect.any(String),
      );
      expect(repository.createDevice).toHaveBeenCalledWith(
        userFixture.id,
        validInput.platform,
        undefined,
      );
      expect(repository.revokeSessionsForDevice).toHaveBeenCalledWith(
        deviceFixture.id,
      );
      expect(repository.createSession).toHaveBeenCalled();
      expect(result.user).toEqual({
        id: userFixture.id,
        email: userFixture.email,
      });
      expect(result.device).toEqual({
        id: deviceFixture.id,
        platform: deviceFixture.platform,
      });
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });
  });

  describe("signIn", () => {
    it("throws UnauthorizedError for wrong password", async () => {
      const passwordHash = await hashPassword("correct-password");
      const repository = createMockRepository({
        findUserByEmail: jest
          .fn()
          .mockResolvedValue({ ...userFixture, passwordHash }),
      });
      const service = new UsersService(repository);

      await expect(
        service.signIn({ ...validInput, password: "wrong-password" }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("reuses device when deviceId matches", async () => {
      const passwordHash = await hashPassword(validInput.password);
      const updatedDevice = { ...deviceFixture, lastSeenAt: new Date() };
      const repository = createMockRepository({
        findUserByEmail: jest
          .fn()
          .mockResolvedValue({ ...userFixture, passwordHash }),
        findDeviceForUser: jest.fn().mockResolvedValue(deviceFixture),
        updateDevice: jest.fn().mockResolvedValue(updatedDevice),
        revokeSessionsForDevice: jest.fn().mockResolvedValue(undefined),
        createSession: jest.fn().mockResolvedValue(sessionFixture),
      });
      const service = new UsersService(repository);

      await service.signIn({ ...validInput, deviceId: deviceFixture.id });

      expect(repository.findDeviceForUser).toHaveBeenCalledWith(
        deviceFixture.id,
        userFixture.id,
      );
      expect(repository.updateDevice).toHaveBeenCalledWith(
        deviceFixture.id,
        undefined,
      );
      expect(repository.createDevice).not.toHaveBeenCalled();
    });

    it("creates device when deviceId is unknown", async () => {
      const passwordHash = await hashPassword(validInput.password);
      const repository = createMockRepository({
        findUserByEmail: jest
          .fn()
          .mockResolvedValue({ ...userFixture, passwordHash }),
        findDeviceForUser: jest.fn().mockResolvedValue(null),
        createDevice: jest.fn().mockResolvedValue(deviceFixture),
        revokeSessionsForDevice: jest.fn().mockResolvedValue(undefined),
        createSession: jest.fn().mockResolvedValue(sessionFixture),
      });
      const service = new UsersService(repository);

      await service.signIn({
        ...validInput,
        deviceId: "unknown-device",
      });

      expect(repository.createDevice).toHaveBeenCalledWith(
        userFixture.id,
        validInput.platform,
        undefined,
      );
    });
  });

  describe("refresh", () => {
    it("throws UnauthorizedError for invalid token", async () => {
      const repository = createMockRepository({
        findActiveSessionByRefreshHash: jest.fn().mockResolvedValue(null),
      });
      const service = new UsersService(repository);

      await expect(service.refresh("invalid-token")).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("rotates refresh token and returns new tokens", async () => {
      const refreshToken = "refresh-token-plain";
      const repository = createMockRepository({
        findActiveSessionByRefreshHash: jest.fn().mockResolvedValue({
          ...sessionFixture,
          user: userFixture,
          device: deviceFixture,
        }),
        rotateSessionRefreshToken: jest
          .fn()
          .mockResolvedValue({ ...sessionFixture, refreshTokenHash: "new-hash" }),
      });
      const service = new UsersService(repository);

      const result = await service.refresh(refreshToken);

      expect(repository.findActiveSessionByRefreshHash).toHaveBeenCalledWith(
        hashRefreshToken(refreshToken),
      );
      expect(repository.rotateSessionRefreshToken).toHaveBeenCalled();
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(result.deviceId).toBe(deviceFixture.id);
    });
  });

  describe("logout", () => {
    it("throws UnauthorizedError when device not found", async () => {
      const repository = createMockRepository({
        deleteDevice: jest.fn().mockResolvedValue(false),
      });
      const service = new UsersService(repository);

      await expect(
        service.logout(userFixture.id, deviceFixture.id),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("deletes device for user", async () => {
      const repository = createMockRepository({
        deleteDevice: jest.fn().mockResolvedValue(true),
      });
      const service = new UsersService(repository);

      await service.logout(userFixture.id, deviceFixture.id);

      expect(repository.deleteDevice).toHaveBeenCalledWith(
        deviceFixture.id,
        userFixture.id,
      );
    });
  });
});
