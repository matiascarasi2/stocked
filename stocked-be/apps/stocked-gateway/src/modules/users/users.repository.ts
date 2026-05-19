import { prisma } from "@stocked/schema";
import type { Device, Session, User } from "@stocked/schema";

export class UsersRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(email: string, passwordHash: string): Promise<User> {
    return prisma.user.create({
      data: { email, passwordHash },
    });
  }

  async findDeviceForUser(
    deviceId: string,
    userId: string,
  ): Promise<Device | null> {
    return prisma.device.findFirst({
      where: { id: deviceId, userId },
    });
  }

  async createDevice(
    userId: string,
    platform: string,
    pushToken?: string,
  ): Promise<Device> {
    return prisma.device.create({
      data: {
        userId,
        platform,
        pushToken: pushToken ?? null,
        lastSeenAt: new Date(),
      },
    });
  }

  async updateDevice(
    deviceId: string,
    pushToken?: string,
  ): Promise<Device> {
    return prisma.device.update({
      where: { id: deviceId },
      data: {
        lastSeenAt: new Date(),
        ...(pushToken !== undefined ? { pushToken } : {}),
      },
    });
  }

  async revokeSessionsForDevice(deviceId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { deviceId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async createSession(
    userId: string,
    deviceId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<Session> {
    return prisma.session.create({
      data: {
        userId,
        deviceId,
        refreshTokenHash,
        expiresAt,
      },
    });
  }

  async findActiveSessionByRefreshHash(
    refreshTokenHash: string,
  ): Promise<(Session & { user: User; device: Device }) | null> {
    return prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true, device: true },
    });
  }

  async rotateSessionRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<Session> {
    return prisma.session.update({
      where: { id: sessionId },
      data: { refreshTokenHash, expiresAt },
    });
  }

  async deleteDevice(deviceId: string, userId: string): Promise<boolean> {
    const result = await prisma.device.deleteMany({
      where: { id: deviceId, userId },
    });
    return result.count > 0;
  }
}
