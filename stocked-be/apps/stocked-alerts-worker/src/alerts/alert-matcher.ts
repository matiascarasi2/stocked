import type { Alert } from "@stocked/schema";
import { AlertsRepository } from "./alerts.repository.js";
import { FcmNotifier } from "../notifications/fcm.js";
import { env } from "../lib/env.js";
import { log } from "console";

export function shouldTriggerCrossing(
  previousPrice: number | null,
  currentPrice: number,
  minPrice: number | null,
  maxPrice: number | null,
): boolean {
  if (previousPrice === null) {
    return false;
  }

  const hasMin = minPrice !== null;
  const hasMax = maxPrice !== null;

  if (hasMin && hasMax) {
    const wasOutside = previousPrice < minPrice || previousPrice > maxPrice;
    const isInside = currentPrice >= minPrice && currentPrice <= maxPrice;
    return wasOutside && isInside;
  }

  if (hasMin) {
    return previousPrice > minPrice && currentPrice <= minPrice;
  }

  if (hasMax) {
    return previousPrice < maxPrice && currentPrice >= maxPrice;
  }

  return false;
}

export function isWithinCooldown(
  lastTriggeredAt: Date | null,
  cooldownMs: number,
  now = Date.now(),
): boolean {
  if (!lastTriggeredAt) {
    return false;
  }
  return now - lastTriggeredAt.getTime() < cooldownMs;
}

export function formatBoundLabel(
  minPrice: number | null,
  maxPrice: number | null,
): string {
  if (minPrice !== null && maxPrice !== null) {
    return `range $${minPrice}–$${maxPrice}`;
  }
  if (minPrice !== null) {
    return `floor $${minPrice}`;
  }
  if (maxPrice !== null) {
    return `ceiling $${maxPrice}`;
  }
  return "target";
}

export class AlertMatcher {
  private readonly previousPrices = new Map<string, number>();

  constructor(
    private readonly repository = new AlertsRepository(),
    private readonly notifier = new FcmNotifier(),
    private readonly cooldownMs = env.alertCooldownMs,
  ) { }

  async handleTrade(symbol: string, currentPrice: number): Promise<void> {
    const normalized = symbol.toUpperCase();
    const previousPrice = this.previousPrices.get(normalized) ?? null;
    this.previousPrices.set(normalized, currentPrice);

    console.log("previousPrice", previousPrice);

    if (previousPrice === null) {
      return;
    }

    const alerts = await this.repository.findActiveBySymbol(normalized);

    for (const alert of alerts) {
      console.log("alert", alert);
      await this.evaluateAlert(alert, previousPrice, currentPrice);
    }
  }

  private async evaluateAlert(
    alert: Alert,
    previousPrice: number,
    currentPrice: number,
  ): Promise<void> {
    const minPrice = alert.minPrice?.toNumber() ?? null;
    const maxPrice = alert.maxPrice?.toNumber() ?? null;

    if (
      !shouldTriggerCrossing(previousPrice, currentPrice, minPrice, maxPrice)
    ) {
      return;
    }

    if (isWithinCooldown(alert.lastTriggeredAt, this.cooldownMs)) {
      return;
    }

    const tokens = await this.repository.findPushTokensForUser(alert.userId);
    if (tokens.length === 0) {
      console.warn(
        `[alerts] Triggered ${alert.id} for user ${alert.userId} but no push tokens`,
      );
    } else {
      await this.notifier.sendPriceAlert({
        tokens,
        symbol: alert.stockSymbol,
        price: currentPrice,
        boundLabel: formatBoundLabel(minPrice, maxPrice),
        alertId: alert.id,
      });
    }

    await this.repository.updateLastTriggeredAt(alert.id, new Date());
  }
}
