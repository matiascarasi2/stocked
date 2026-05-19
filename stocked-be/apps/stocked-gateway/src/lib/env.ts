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
};
