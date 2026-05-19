import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { SymbolRegistry } from "./symbol-registry.js";
import type { FinnhubTradesSocket } from "../finnhub/trades-socket.js";

const { prisma } = await import("@stocked/schema");

function createMockFinnhub(): FinnhubTradesSocket & {
  subscribe: jest.Mock;
  unsubscribe: jest.Mock;
  getSubscribedSymbols: jest.Mock;
} {
  const subscribed = new Set<string>();
  return {
    subscribe: jest.fn((symbol: string) => {
      subscribed.add(symbol);
    }),
    unsubscribe: jest.fn((symbol: string) => {
      subscribed.delete(symbol);
    }),
    getSubscribedSymbols: jest.fn(() => [...subscribed]),
    onTrade: jest.fn(),
    connect: jest.fn(),
    close: jest.fn(),
  } as unknown as FinnhubTradesSocket & {
    subscribe: jest.Mock;
    unsubscribe: jest.Mock;
    getSubscribedSymbols: jest.Mock;
  };
}

describe("SymbolRegistry", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("subscribes when active alert count is positive and symbol is new", async () => {
    const finnhub = createMockFinnhub();
    const registry = new SymbolRegistry(finnhub);

    jest.spyOn(prisma.alert, "count").mockResolvedValue(2);

    await registry.syncSymbol("aapl");

    expect(finnhub.subscribe).toHaveBeenCalledWith("AAPL");
    expect(finnhub.unsubscribe).not.toHaveBeenCalled();
  });

  it("unsubscribes when no active alerts remain", async () => {
    const finnhub = createMockFinnhub();
    finnhub.getSubscribedSymbols.mockReturnValue(["AAPL"]);
    const registry = new SymbolRegistry(finnhub);

    jest.spyOn(prisma.alert, "count").mockResolvedValue(0);

    await registry.syncSymbol("AAPL");

    expect(finnhub.unsubscribe).toHaveBeenCalledWith("AAPL");
    expect(finnhub.subscribe).not.toHaveBeenCalled();
  });

  it("reconcileAll subscribes distinct active symbols", async () => {
    const finnhub = createMockFinnhub();
    const registry = new SymbolRegistry(finnhub);

    jest.spyOn(prisma.alert, "findMany").mockResolvedValue([
      { stockSymbol: "AAPL" },
      { stockSymbol: "MSFT" },
    ] as never);

    await registry.reconcileAll();

    expect(finnhub.subscribe).toHaveBeenCalledWith("AAPL");
    expect(finnhub.subscribe).toHaveBeenCalledWith("MSFT");
  });
});
