import { prisma } from "@stocked/schema";
import { env } from "../lib/env.js";
import type { FinnhubTradesSocket } from "../finnhub/trades-socket.js";

export class SymbolRegistry {
  constructor(private readonly finnhub: FinnhubTradesSocket) {}

  async syncSymbol(symbol: string): Promise<void> {
    const normalized = symbol.trim().toUpperCase();
    if (!normalized) {
      return;
    }

    const count = await prisma.alert.count({
      where: { stockSymbol: normalized, isActive: true },
    });

    const subscribed = new Set(this.finnhub.getSubscribedSymbols());

    if (count > 0 && !subscribed.has(normalized)) {
      if (subscribed.size >= env.maxWebSocketSymbols) {
        console.warn(
          `[symbols] Cannot subscribe ${normalized}: at Finnhub symbol cap (${env.maxWebSocketSymbols})`,
        );
        return;
      }
      this.finnhub.subscribe(normalized);
    } else if (count === 0 && subscribed.has(normalized)) {
      this.finnhub.unsubscribe(normalized);
    }
  }

  async reconcileAll(): Promise<void> {
    const rows = await prisma.alert.findMany({
      where: { isActive: true },
      select: { stockSymbol: true },
      distinct: ["stockSymbol"],
    });

    const symbols = rows.map((row) => row.stockSymbol.toUpperCase());
    if (symbols.length > env.maxWebSocketSymbols) {
      console.warn(
        `[symbols] ${symbols.length} active symbols exceed cap (${env.maxWebSocketSymbols}); subscribing first ${env.maxWebSocketSymbols}`,
      );
    }

    for (const symbol of symbols.slice(0, env.maxWebSocketSymbols)) {
      this.finnhub.subscribe(symbol);
    }

    const target = new Set(symbols.slice(0, env.maxWebSocketSymbols));
    for (const symbol of this.finnhub.getSubscribedSymbols()) {
      if (!target.has(symbol)) {
        this.finnhub.unsubscribe(symbol);
      }
    }
  }
}
