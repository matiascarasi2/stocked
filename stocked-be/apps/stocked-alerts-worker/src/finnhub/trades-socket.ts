import WebSocket from "ws";
import { env } from "../lib/env.js";

export type TradeTick = {
  symbol: string;
  price: number;
  timestamp: number;
};

type FinnhubTradePayload = {
  p: number;
  s: string;
  t: number;
  v?: number;
};

type FinnhubMessage =
  | { type: "trade"; data: FinnhubTradePayload[] }
  | { type: "ping" }
  | { type: string };

export type TradeHandler = (tick: TradeTick) => void;

export class FinnhubTradesSocket {
  private ws: WebSocket | null = null;
  private readonly subscribed = new Set<string>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private tradeHandler: TradeHandler | null = null;
  private intentionalClose = false;

  onTrade(handler: TradeHandler): void {
    this.tradeHandler = handler;
  }

  connect(): void {
    this.intentionalClose = false;
    const url = `wss://ws.finnhub.io?token=${env.finnhubApiKey}`;
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("[finnhub] WebSocket connected");
      for (const symbol of this.subscribed) {
        this.sendSubscribe(symbol);
      }
    });

    this.ws.on("message", (raw) => {
      try {
        const message = JSON.parse(String(raw)) as FinnhubMessage;
        if (message.type === "ping") {
          return;
        }
        if (message.type !== "trade" || !("data" in message)) {
          return;
        }
        for (const trade of message.data) {
          this.tradeHandler?.({
            symbol: trade.s.toUpperCase(),
            price: trade.p,
            timestamp: trade.t,
          });
        }
      } catch (error) {
        console.error("[finnhub] Failed to parse message", error);
      }
    });

    this.ws.on("close", () => {
      console.warn("[finnhub] WebSocket closed");
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    });

    this.ws.on("error", (error) => {
      console.error("[finnhub] WebSocket error", error);
    });
  }

  subscribe(symbol: string): void {
    const normalized = symbol.toUpperCase();
    if (this.subscribed.has(normalized)) {
      return;
    }
    this.subscribed.add(normalized);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(normalized);
    }
  }

  unsubscribe(symbol: string): void {
    const normalized = symbol.toUpperCase();
    if (!this.subscribed.has(normalized)) {
      return;
    }
    this.subscribed.delete(normalized);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendUnsubscribe(normalized);
    }
  }

  getSubscribedSymbols(): string[] {
    return [...this.subscribed];
  }

  close(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  private sendSubscribe(symbol: string): void {
    this.ws?.send(JSON.stringify({ type: "subscribe", symbol }));
    console.log(`[finnhub] subscribed ${symbol}`);
  }

  private sendUnsubscribe(symbol: string): void {
    this.ws?.send(JSON.stringify({ type: "unsubscribe", symbol }));
    console.log(`[finnhub] unsubscribed ${symbol}`);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log("[finnhub] reconnecting...");
      this.connect();
    }, 5000);
  }
}
