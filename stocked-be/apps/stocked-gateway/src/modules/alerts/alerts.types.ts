import type { Alert } from "@stocked/schema";

type DecimalLike = { toNumber(): number };

export type AlertDto = {
  id: string;
  stockSymbol: string;
  minPrice: number | null;
  maxPrice: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt: string | null;
};

export type CreateAlertInput = {
  stockSymbol: string;
  minPrice: number | null;
  maxPrice: number | null;
};

export type UpdateAlertInput = {
  minPrice?: number | null;
  maxPrice?: number | null;
  isActive?: boolean;
};

export function toAlertDto(alert: Alert): AlertDto {
  return {
    id: alert.id,
    stockSymbol: alert.stockSymbol,
    minPrice: decimalToNumber(alert.minPrice),
    maxPrice: decimalToNumber(alert.maxPrice),
    isActive: alert.isActive,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString(),
    lastTriggeredAt: alert.lastTriggeredAt?.toISOString() ?? null,
  };
}

function decimalToNumber(value: DecimalLike | null): number | null {
  if (value == null) {
    return null;
  }
  return value.toNumber();
}
