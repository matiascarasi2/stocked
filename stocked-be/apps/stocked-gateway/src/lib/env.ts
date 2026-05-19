function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  jwtAccessSecret: requireEnv(
    "JWT_ACCESS_SECRET",
    process.env.JWT_ACCESS_SECRET,
  ),
  jwtAccessTtlSeconds: Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30),
  finnhubApiKey: requireEnv("FINNHUB_API_KEY", process.env.FINNHUB_API_KEY),
  fmpApiKey: requireEnv("FMP_API_KEY", process.env.FMP_API_KEY),
  alertsWorkerUrl: process.env.ALERTS_WORKER_URL ?? "http://localhost:3001",
  alertsWorkerInternalSecret: requireEnv(
    "ALERTS_WORKER_INTERNAL_SECRET",
    process.env.ALERTS_WORKER_INTERNAL_SECRET,
  ),
};
