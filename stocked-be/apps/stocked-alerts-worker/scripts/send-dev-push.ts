/**
 * Dev-only: send a production-shaped price-alert push to one device.
 * Edit the constants below, then: pnpm --filter @stocked/alerts-worker dev:push
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import admin from "firebase-admin";

// --- edit before running (do not commit a real token) ---
const FCM_TOKEN = "fgQfd-gVS2OkVgxnicFciG:APA91bGzX--woXTwyqyuPpYT1V0gRh_Wvs-d7aNd7a0xQMCkXU-pr4DrsRWaEuB_fS8yq5HxxE3nBQGk6nb34gOUOiEeuMBXlHFy9JwDd5H40puwxsYM0QI";
const SYMBOL = "AAPL";
const PRICE = 189.42;
const BOUND_LABEL = "max price";
const ALERT_ID = "demo-alert";
// ---

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
if (!serviceAccountPath) {
  console.error(
    "FIREBASE_SERVICE_ACCOUNT_PATH is not set in apps/stocked-alerts-worker/.env",
  );
  process.exit(1);
}

// @ts-expect-error - FCM_TOKEN is set in the environment
if (FCM_TOKEN === "YOUR_FCM_TOKEN_HERE" || !FCM_TOKEN.trim()) {
  console.error(
    "Set FCM_TOKEN in scripts/send-dev-push.ts (copy from Metro [FCM] Token: log)",
  );
  process.exit(1);
}

const json = readFileSync(serviceAccountPath, "utf8");
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(json) as admin.ServiceAccount),
});

const response = await admin.messaging().sendEachForMulticast({
  tokens: [FCM_TOKEN],
  notification: {
    title: `${SYMBOL} alert`,
    body: `Price crossed your ${BOUND_LABEL} ($${PRICE.toFixed(2)})`,
  },
  data: {
    type: "price_alert",
    alertId: ALERT_ID,
    stockSymbol: SYMBOL,
    price: String(PRICE),
  },
  android: { priority: "high" },
});

const { successCount, failureCount } = response;
console.log(`Sent: ${successCount} ok, ${failureCount} failed`);

for (let i = 0; i < response.responses.length; i++) {
  const result = response.responses[i];
  if (!result.success && result.error) {
    console.error(`Token ${i}: ${result.error.code} — ${result.error.message}`);
  }
}

if (failureCount > 0) {
  process.exit(1);
}
