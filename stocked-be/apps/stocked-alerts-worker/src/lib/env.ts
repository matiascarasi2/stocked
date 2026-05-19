function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  finnhubApiKey: requireEnv("FINNHUB_API_KEY", process.env.FINNHUB_API_KEY),
  internalSecret: requireEnv(
    "ALERTS_WORKER_INTERNAL_SECRET",
    process.env.ALERTS_WORKER_INTERNAL_SECRET,
  ),
  firebaseServiceAccountPath:
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() || null,
  alertCooldownMs:
    Number(process.env.ALERT_COOLDOWN_MINUTES ?? 15) * 60 * 1000,
  maxWebSocketSymbols: Number(process.env.MAX_WEBSOCKET_SYMBOLS ?? 50),
};
