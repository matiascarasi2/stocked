import { hashPassword, verifyPassword } from "../../lib/password.js";
import {
  createRefreshToken,
  hashRefreshToken,
  refreshTokenExpiresAt,
  signAccessToken,
} from "../../lib/tokens.js";
import type { RegisterSignInInput } from "./users.validation.js";
import { UsersRepository } from "./users.repository.js";
import {
  ConflictError,
  UnauthorizedError,
} from "./users.errors.js";

export type AuthTokensResponse = {
  user: { id: string; email: string };
  device: { id: string; platform: string };
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokensResponse = {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
};

export class UsersService {
  constructor(private readonly repository = new UsersRepository()) {}

  async register(input: RegisterSignInInput): Promise<AuthTokensResponse> {
    const existing = await this.repository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.repository.createUser(input.email, passwordHash);
    const device = await this.repository.createDevice(
      user.id,
      input.platform,
      input.pushToken,
    );

    return this.issueTokensForDevice(user, device);
  }

  async signIn(input: RegisterSignInInput): Promise<AuthTokensResponse> {
    const user = await this.repository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const device = await this.resolveDeviceForSignIn(user.id, input);

    return this.issueTokensForDevice(user, device);
  }

  async refresh(refreshToken: string): Promise<RefreshTokensResponse> {
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const session =
      await this.repository.findActiveSessionByRefreshHash(refreshTokenHash);

    if (!session) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const newRefreshToken = createRefreshToken();
    const newHash = hashRefreshToken(newRefreshToken);
    const expiresAt = refreshTokenExpiresAt();

    await this.repository.rotateSessionRefreshToken(
      session.id,
      newHash,
      expiresAt,
    );

    const accessToken = await signAccessToken({
      sub: session.user.id,
      deviceId: session.deviceId,
      sessionId: session.id,
      tv: session.user.tokenVersion,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      deviceId: session.deviceId,
    };
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    const deleted = await this.repository.deleteDevice(deviceId, userId);
    if (!deleted) {
      throw new UnauthorizedError("Device not found");
    }
  }

  private async resolveDeviceForSignIn(
    userId: string,
    input: RegisterSignInInput,
  ): Promise<{ id: string; platform: string }> {
    if (input.deviceId) {
      const device = await this.repository.findDeviceForUser(
        input.deviceId,
        userId,
      );
      if (device) {
        return this.repository.updateDevice(device.id, input.pushToken);
      }
    }

    if (input.pushToken) {
      const device = await this.repository.findDeviceByPushTokenForUser(
        userId,
        input.pushToken,
      );
      if (device) {
        return this.repository.updateDevice(device.id, input.pushToken);
      }
    }

    return this.repository.createDevice(
      userId,
      input.platform,
      input.pushToken,
    );
  }

  private async issueTokensForDevice(
    user: { id: string; email: string; tokenVersion: number },
    device: { id: string; platform: string },
  ): Promise<AuthTokensResponse> {
    await this.repository.revokeSessionsForDevice(device.id);

    const refreshToken = createRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = refreshTokenExpiresAt();

    const session = await this.repository.createSession(
      user.id,
      device.id,
      refreshTokenHash,
      expiresAt,
    );

    const accessToken = await signAccessToken({
      sub: user.id,
      deviceId: device.id,
      sessionId: session.id,
      tv: user.tokenVersion,
    });

    return {
      user: { id: user.id, email: user.email },
      device: { id: device.id, platform: device.platform },
      accessToken,
      refreshToken,
    };
  }
}
