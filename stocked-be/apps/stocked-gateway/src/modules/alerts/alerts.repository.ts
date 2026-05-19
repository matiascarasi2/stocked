import { prisma } from "@stocked/schema";
import type { Alert } from "@stocked/schema";
import { NotFoundError } from "./alerts.errors.js";

export type CreateAlertData = {
  userId: string;
  stockSymbol: string;
  minPrice: number | null;
  maxPrice: number | null;
};

export type UpdateAlertData = {
  minPrice?: number | null;
  maxPrice?: number | null;
  isActive?: boolean;
};

export class AlertsRepository {
  async findMany(
    userId: string,
    includeInactive: boolean,
  ): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: {
        userId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string, userId: string): Promise<Alert | null> {
    return prisma.alert.findFirst({
      where: { id, userId },
    });
  }

  async create(data: CreateAlertData): Promise<Alert> {
    return prisma.alert.create({
      data: {
        userId: data.userId,
        stockSymbol: data.stockSymbol,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: UpdateAlertData,
  ): Promise<Alert> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Alert not found");
    }

    return prisma.alert.update({
      where: { id },
      data: {
        ...(data.minPrice !== undefined ? { minPrice: data.minPrice } : {}),
        ...(data.maxPrice !== undefined ? { maxPrice: data.maxPrice } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  async softDelete(id: string, userId: string): Promise<Alert> {
    const result = await prisma.alert.updateMany({
      where: { id, userId },
      data: { isActive: false },
    });

    if (result.count === 0) {
      throw new NotFoundError("Alert not found");
    }

    const alert = await this.findById(id, userId);
    if (!alert) {
      throw new NotFoundError("Alert not found");
    }

    return alert;
  }
}
