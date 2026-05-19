process.env.FINNHUB_API_KEY = "test-finnhub-key";
process.env.ALERTS_WORKER_INTERNAL_SECRET = "test-worker-secret";
process.env.PORT = "3001";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://test:test@localhost:5432/stocked_test";
