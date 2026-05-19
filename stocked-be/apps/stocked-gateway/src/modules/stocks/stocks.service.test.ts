import { describe, expect, it, jest } from "@jest/globals";
import { NotFoundError } from "./stocks.errors.js";
import type { StocksRepository } from "./stocks.repository.js";
import { StocksService } from "./stocks.service.js";
import type { FinnhubQuote, FinnhubStockSymbol } from "./stocks.types.js";

const symbolFixtures: FinnhubStockSymbol[] = [
  {
    symbol: "AAPL",
    displaySymbol: "AAPL",
    description: "Apple Inc.",
    type: "Common Stock",
  },
  {
    symbol: "GOOGL",
    displaySymbol: "GOOGL",
    description: "Alphabet Inc.",
    type: "Common Stock",
  },
  {
    symbol: "MSFT",
    displaySymbol: "MSFT",
    description: "Microsoft Corp.",
    type: "Common Stock",
  },
];

const quoteFixtures: Record<string, FinnhubQuote> = {
  AAPL: { c: 178.45, d: 2.34, dp: 1.33 },
  GOOGL: { c: 142.87, d: -1.23, dp: -0.85 },
  MSFT: { c: 412.56, d: 5.67, dp: 1.39 },
};

function createMockRepository(
  overrides: Partial<jest.Mocked<StocksRepository>> = {},
): jest.Mocked<StocksRepository> {
  return {
    getUsSymbols: jest.fn(),
    getDistinctAlertSymbols: jest.fn(),
    searchSymbols: jest.fn(),
    getQuote: jest.fn().mockImplementation((symbol: string) => {
      const quote = quoteFixtures[symbol.toUpperCase()];
      if (quote) {
        return Promise.resolve(quote);
      }
      return Promise.resolve({ c: 100, d: 1, dp: 1 });
    }),
    getHistoricalPrices: jest.fn(),
    ...overrides,
  };
}

describe("StocksService", () => {
  describe("searchStocks", () => {
    it("maps search results and filters to common stock", async () => {
      const repository = createMockRepository({
        searchSymbols: jest.fn().mockResolvedValue({
          count: 2,
          result: [
            {
              symbol: "AAPL",
              displaySymbol: "AAPL",
              description: "Apple Inc.",
              type: "Common Stock",
            },
            {
              symbol: "AAPL-WT",
              displaySymbol: "AAPL-WT",
              description: "Apple Warrant",
              type: "Warrant",
            },
          ],
        }),
      });
      const service = new StocksService(repository);

      const result = await service.searchStocks("AAPL");

      expect(repository.searchSymbols).toHaveBeenCalledWith("AAPL");
      expect(result).toEqual([
        { id: "aapl", symbol: "AAPL", name: "Apple Inc." },
      ]);
    });

    it("deduplicates search results with the same display symbol", async () => {
      const repository = createMockRepository({
        searchSymbols: jest.fn().mockResolvedValue({
          count: 2,
          result: [
            {
              symbol: "APP",
              displaySymbol: "APP",
              description: "Applovin Corp",
              type: "Common Stock",
            },
            {
              symbol: "APP.US",
              displaySymbol: "APP",
              description: "Applovin Corp Class A",
              type: "Common Stock",
            },
          ],
        }),
      });
      const service = new StocksService(repository);

      const result = await service.searchStocks("APP");

      expect(result).toEqual([
        { id: "app", symbol: "APP", name: "Applovin Corp" },
      ]);
    });
  });

  describe("listWatchedStocks", () => {
    it("returns deduplicated stocks for distinct alert symbols", async () => {
      const repository = createMockRepository({
        getDistinctAlertSymbols: jest
          .fn()
          .mockResolvedValue(["AAPL", "GOOGL", "AAPL"]),
        getUsSymbols: jest.fn().mockResolvedValue(symbolFixtures),
      });
      const service = new StocksService(repository);

      const result = await service.listWatchedStocks("user-1");

      expect(repository.getDistinctAlertSymbols).toHaveBeenCalledWith("user-1");
      expect(result).toEqual([
        {
          id: "aapl",
          symbol: "AAPL",
          name: "Apple Inc.",
          price: 178.45,
          change: 2.34,
          changePercent: 1.33,
        },
        {
          id: "googl",
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          price: 142.87,
          change: -1.23,
          changePercent: -0.85,
        },
      ]);
    });

    it("returns stocks without quote fields when quote fetch fails", async () => {
      const repository = createMockRepository({
        getDistinctAlertSymbols: jest.fn().mockResolvedValue(["AAPL"]),
        getUsSymbols: jest.fn().mockResolvedValue(symbolFixtures),
        getQuote: jest.fn().mockRejectedValue(new Error("upstream")),
      });
      const service = new StocksService(repository);

      const result = await service.listWatchedStocks("user-1");

      expect(result).toEqual([
        { id: "aapl", symbol: "AAPL", name: "Apple Inc." },
      ]);
    });

    it("returns stocks without quote fields when quote data is invalid", async () => {
      const repository = createMockRepository({
        getDistinctAlertSymbols: jest.fn().mockResolvedValue(["AAPL"]),
        getUsSymbols: jest.fn().mockResolvedValue(symbolFixtures),
        getQuote: jest.fn().mockResolvedValue({ c: 0, d: 0, dp: 0 }),
      });
      const service = new StocksService(repository);

      const result = await service.listWatchedStocks("user-1");

      expect(result).toEqual([
        { id: "aapl", symbol: "AAPL", name: "Apple Inc." },
      ]);
    });

    it("returns empty array when user has no alerts", async () => {
      const repository = createMockRepository({
        getDistinctAlertSymbols: jest.fn().mockResolvedValue([]),
        getUsSymbols: jest.fn(),
      });
      const service = new StocksService(repository);

      const result = await service.listWatchedStocks("user-1");

      expect(result).toEqual([]);
      expect(repository.getUsSymbols).not.toHaveBeenCalled();
    });

    it("skips symbols not found in US cache", async () => {
      const repository = createMockRepository({
        getDistinctAlertSymbols: jest
          .fn()
          .mockResolvedValue(["AAPL", "UNKNOWN"]),
        getUsSymbols: jest.fn().mockResolvedValue(symbolFixtures),
      });
      const service = new StocksService(repository);

      const result = await service.listWatchedStocks("user-1");

      expect(result).toEqual([
        {
          id: "aapl",
          symbol: "AAPL",
          name: "Apple Inc.",
          price: 178.45,
          change: 2.34,
          changePercent: 1.33,
        },
      ]);
    });
  });

  describe("listPopularStocks", () => {
    const popularFixtures: FinnhubStockSymbol[] = [
      ...symbolFixtures,
      {
        symbol: "AMZN",
        displaySymbol: "AMZN",
        description: "Amazon.com Inc.",
        type: "Common Stock",
      },
      {
        symbol: "TSLA",
        displaySymbol: "TSLA",
        description: "Tesla Inc.",
        type: "Common Stock",
      },
      {
        symbol: "META",
        displaySymbol: "META",
        description: "Meta Platforms",
        type: "Common Stock",
      },
      {
        symbol: "NVDA",
        displaySymbol: "NVDA",
        description: "NVIDIA Corp.",
        type: "Common Stock",
      },
      {
        symbol: "NFLX",
        displaySymbol: "NFLX",
        description: "Netflix Inc.",
        type: "Common Stock",
      },
    ];

    it("returns popular stocks in fixed order with quote enrichment", async () => {
      const repository = createMockRepository({
        getUsSymbols: jest.fn().mockResolvedValue(popularFixtures),
        getQuote: jest.fn().mockImplementation((symbol: string) => {
          const quotes: Record<string, FinnhubQuote> = {
            AAPL: { c: 178.45, d: 2.34, dp: 1.33 },
            GOOGL: { c: 142.87, d: -1.23, dp: -0.85 },
            MSFT: { c: 412.56, d: 5.67, dp: 1.39 },
            AMZN: { c: 178.23, d: 3.45, dp: 1.97 },
            TSLA: { c: 248.92, d: -4.12, dp: -1.63 },
            META: { c: 487.34, d: 8.23, dp: 1.72 },
            NVDA: { c: 875.28, d: 12.45, dp: 1.44 },
            NFLX: { c: 623.45, d: -2.34, dp: -0.37 },
          };
          return Promise.resolve(quotes[symbol.toUpperCase()]!);
        }),
      });
      const service = new StocksService(repository);

      const result = await service.listPopularStocks();

      expect(result.map((stock) => stock.symbol)).toEqual([
        "AAPL",
        "GOOGL",
        "MSFT",
        "AMZN",
        "TSLA",
        "META",
        "NVDA",
        "NFLX",
      ]);
      expect(result[0]).toMatchObject({
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 178.45,
        change: 2.34,
        changePercent: 1.33,
      });
    });

    it("skips popular symbols missing from the US cache", async () => {
      const repository = createMockRepository({
        getUsSymbols: jest.fn().mockResolvedValue(symbolFixtures),
      });
      const service = new StocksService(repository);

      const result = await service.listPopularStocks();

      expect(result.map((stock) => stock.symbol)).toEqual([
        "AAPL",
        "GOOGL",
        "MSFT",
      ]);
    });
  });

  describe("getStock", () => {
    it("returns a single stock from the cached US list", async () => {
      const repository = createMockRepository({
        getUsSymbols: jest.fn().mockResolvedValue(symbolFixtures),
      });
      const service = new StocksService(repository);

      const result = await service.getStock("GOOGL");

      expect(result).toEqual({
        id: "googl",
        symbol: "GOOGL",
        name: "Alphabet Inc.",
      });
    });

    it("throws NotFoundError when symbol is missing", async () => {
      const repository = createMockRepository({
        getUsSymbols: jest.fn().mockResolvedValue(symbolFixtures),
      });
      const service = new StocksService(repository);

      await expect(service.getStock("UNKNOWN")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getStockChart", () => {
    it("returns chart data for a known symbol", async () => {
      const chartPoints = [
        {
          date: "2025-01-02",
          open: 185,
          high: 186.5,
          low: 184.2,
          close: 185.8,
          volume: 52_000_000,
        },
        {
          date: "2025-01-03",
          open: 186,
          high: 187,
          low: 185.5,
          close: 186.2,
          volume: 48_000_000,
        },
      ];
      const repository = createMockRepository({
        getUsSymbols: jest.fn().mockResolvedValue(symbolFixtures),
        getHistoricalPrices: jest.fn().mockResolvedValue(chartPoints),
      });
      const service = new StocksService(repository);

      const result = await service.getStockChart("AAPL", "1Y");

      expect(repository.getHistoricalPrices).toHaveBeenCalledWith(
        "AAPL",
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      );
      expect(result).toEqual({
        symbol: "AAPL",
        range: "1Y",
        points: chartPoints,
      });
    });

    it("does not call FMP when symbol is not found", async () => {
      const repository = createMockRepository({
        getUsSymbols: jest.fn().mockResolvedValue(symbolFixtures),
        getHistoricalPrices: jest.fn(),
      });
      const service = new StocksService(repository);

      await expect(service.getStockChart("UNKNOWN", "1M")).rejects.toThrow(
        NotFoundError,
      );
      expect(repository.getHistoricalPrices).not.toHaveBeenCalled();
    });
  });
});
