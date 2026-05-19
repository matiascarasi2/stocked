import { prisma } from "@stocked/schema";
import type { Alert } from "@stocked/schema";

export class AlertsRepository {
  async findActiveBySymbol(stockSymbol: string): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: { stockSymbol, isActive: true },
    });
  }

  async findPushTokensForUser(userId: string): Promise<string[]> {
    const devices = await prisma.device.findMany({
      where: { userId, pushToken: { not: null } },
      select: { pushToken: true },
    });

    return devices
      .map((device) => device.pushToken)
      .filter((token): token is string => token !== null);
  }

  async updateLastTriggeredAt(alertId: string, at: Date): Promise<void> {
    await prisma.alert.update({
      where: { id: alertId },
      data: { lastTriggeredAt: at },
    });
  }

  async clearPushToken(token: string): Promise<void> {
    await prisma.device.updateMany({
      where: { pushToken: token },
      data: { pushToken: null },
    });
  }
}
