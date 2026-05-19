export type AlertsWorkerClientConfig = {
  baseUrl: string;
  internalSecret: string;
};

export class AlertsWorkerClient {
  constructor(private readonly config: AlertsWorkerClientConfig) {}

  async syncSymbol(symbol: string): Promise<void> {
    const normalized = symbol.trim().toUpperCase();
    if (!normalized) {
      return;
    }

    const url = new URL("/internal/symbols/sync", this.config.baseUrl);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": this.config.internalSecret,
      },
      body: JSON.stringify({ symbol: normalized }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Alerts worker sync failed (${response.status})${body ? `: ${body}` : ""}`,
      );
    }
  }
}

export function createAlertsWorkerClient(
  config: AlertsWorkerClientConfig,
): AlertsWorkerClient {
  return new AlertsWorkerClient(config);
}
