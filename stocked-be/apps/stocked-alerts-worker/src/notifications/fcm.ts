import { readFileSync } from "node:fs";
import admin from "firebase-admin";
import { env } from "../lib/env.js";
import { AlertsRepository } from "../alerts/alerts.repository.js";

export type PriceAlertNotification = {
  tokens: string[];
  symbol: string;
  price: number;
  boundLabel: string;
  alertId: string;
};

let initialized = false;

function ensureFirebase(): boolean {
  if (initialized) {
    return true;
  }
  if (!env.firebaseServiceAccountPath) {
    console.warn(
      "[fcm] FIREBASE_SERVICE_ACCOUNT_PATH not set; push notifications disabled",
    );
    return false;
  }

  const json = readFileSync(env.firebaseServiceAccountPath, "utf8");
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(json) as admin.ServiceAccount),
  });
  initialized = true;
  return true;
}

export class FcmNotifier {
  constructor(private readonly repository = new AlertsRepository()) {}

  async sendPriceAlert(input: PriceAlertNotification): Promise<void> {
    if (input.tokens.length === 0) {
      return;
    }

    if (!ensureFirebase()) {
      console.log(
        `[fcm] Would notify ${input.tokens.length} device(s) for ${input.symbol} @ ${input.price}`,
      );
      return;
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens: input.tokens,
      notification: {
        title: `${input.symbol} alert`,
        body: `Price crossed your ${input.boundLabel} ($${input.price.toFixed(2)})`,
      },
      data: {
        type: "price_alert",
        alertId: input.alertId,
        stockSymbol: input.symbol,
        price: String(input.price),
      },
      android: { priority: "high" },
    });

    for (let i = 0; i < response.responses.length; i++) {
      const result = response.responses[i];
      if (!result.success && result.error) {
        const code = result.error.code;
        const token = input.tokens[i];
        console.warn(`[fcm] Failed for token ${token}: ${code}`);
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        ) {
          await this.repository.clearPushToken(token);
        }
      }
    }
  }
}
