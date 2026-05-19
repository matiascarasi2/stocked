import { createAlertsWorkerClient } from "@stocked/alerts-worker-client";
import { env } from "./env.js";

const client = createAlertsWorkerClient({
  baseUrl: env.alertsWorkerUrl,
  internalSecret: env.alertsWorkerInternalSecret,
});

export function notifyAlertsWorkerSymbol(symbol: string): void {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  void client.syncSymbol(symbol).catch((error) => {
    console.warn(
      `[alerts-worker] Failed to sync symbol ${symbol}:`,
      error instanceof Error ? error.message : error,
    );
  });
}
