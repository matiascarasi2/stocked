import type { RemoteMessage } from "./types";

export type AlertToastContent = {
  title: string;
  body: string;
};

export function parsePriceAlertMessage(
  message: RemoteMessage,
): AlertToastContent | null {
  if (message.data?.type !== "price_alert") {
    return null;
  }

  const symbol = message.data.stockSymbol ?? "Stock";
  const price = message.data.price;

  const title = message.notification?.title ?? `${symbol} alert`;
  const body =
    message.notification?.body ??
    (price != null && price !== ""
      ? `Price alert triggered at $${Number(price).toFixed(2)}`
      : "Your price alert was triggered");

  return { title, body };
}
