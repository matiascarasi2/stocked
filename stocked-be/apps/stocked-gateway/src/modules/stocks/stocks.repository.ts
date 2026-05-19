import { prisma } from "@stocked/schema";
import { env } from "../../lib/env.js";
import { UpstreamError } from "./stocks.errors.js";
import type {
  FinnhubQuote,
  FinnhubStockSymbol,
  FinnhubSymbolLookup,
  FmpHistoricalPrice,
  StockChartPoint,
} from "./stocks.types.js";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const FMP_BASE = "https://financialmodelingprep.com/stable";
const US_SYMBOL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const HISTORICAL_PRICES_CACHE_TTL_MS = 60 * 60 * 1000;
const QUOTE_CACHE_TTL_MS = 60 * 1000;

type HistoricalPricesCacheEntry = {
  points: StockChartPoint[];
  fetchedAt: number;
};

type QuoteCacheEntry = {
  quote: FinnhubQuote;
  fetchedAt: number;
};

export class StocksRepository {
  private usSymbolsCache: FinnhubStockSymbol[] | null = null;
  private usSymbolsFetchedAt = 0;
  private historicalPricesCache = new Map<string, HistoricalPricesCacheEntry>();
  private quoteCache = new Map<string, QuoteCacheEntry>();

  async getUsSymbols(): Promise<FinnhubStockSymbol[]> {
    const now = Date.now();
    if (
      this.usSymbolsCache &&
      now - this.usSymbolsFetchedAt < US_SYMBOL_CACHE_TTL_MS
    ) {
      return this.usSymbolsCache;
    }

    const symbols = await this.finnhubGet<FinnhubStockSymbol[]>("/stock/symbol", {
      exchange: "US",
    });

    this.usSymbolsCache = symbols;
    this.usSymbolsFetchedAt = now;
    return symbols;
  }

  async getDistinctAlertSymbols(userId: string): Promise<string[]> {
    const rows = await prisma.alert.findMany({
      where: { userId, isActive: true },
      distinct: ["stockSymbol"],
      select: { stockSymbol: true },
      orderBy: { stockSymbol: "asc" },
    });

    return rows.map((row) => row.stockSymbol);
  }

  async searchSymbols(query: string): Promise<FinnhubSymbolLookup> {
    return this.finnhubGet<FinnhubSymbolLookup>("/search", {
      q: query,
      exchange: "US",
    });
  }

  async getQuote(symbol: string): Promise<FinnhubQuote> {
    const cacheKey = symbol.toUpperCase();
    const now = Date.now();
    const cached = this.quoteCache.get(cacheKey);

    if (cached && now - cached.fetchedAt < QUOTE_CACHE_TTL_MS) {
      return cached.quote;
    }

    const quote = await this.finnhubGet<FinnhubQuote>("/quote", {
      symbol: cacheKey,
    });

    this.quoteCache.set(cacheKey, { quote, fetchedAt: now });
    return quote;
  }

  async getHistoricalPrices(
    symbol: string,
    from: string,
    to: string,
  ): Promise<StockChartPoint[]> {
    const cacheKey = `${symbol.toUpperCase()}:${from}:${to}`;
    const now = Date.now();
    const cached = this.historicalPricesCache.get(cacheKey);

    if (
      cached &&
      now - cached.fetchedAt < HISTORICAL_PRICES_CACHE_TTL_MS
    ) {
      return cached.points;
    }

    const rows = await this.fmpGet<FmpHistoricalPrice[]>(
      "/historical-price-eod/full",
      {
        symbol,
        from,
        to,
      },
    );

    const points = mapFmpHistoricalPrices(rows);
    this.historicalPricesCache.set(cacheKey, { points, fetchedAt: now });
    return points;
  }

  private async finnhubGet<T>(
    path: string,
    params: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${FINNHUB_BASE}${path}`);
    url.searchParams.set("token", env.finnhubApiKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new UpstreamError("Failed to reach Finnhub");
    }

    if (!response.ok) {
      throw new UpstreamError(`Finnhub request failed (${response.status})`);
    }

    return response.json() as Promise<T>;
  }

  private async fmpGet<T>(
    path: string,
    params: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${FMP_BASE}${path}`);
    url.searchParams.set("apikey", env.fmpApiKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new UpstreamError("Failed to reach FMP");
    }

    if (!response.ok) {
      throw new UpstreamError(`FMP request failed (${response.status})`);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new UpstreamError("FMP returned unexpected response");
    }

    return data as T;
  }
}

function mapFmpHistoricalPrices(rows: FmpHistoricalPrice[]): StockChartPoint[] {
  const points: StockChartPoint[] = [];

  for (const row of rows) {
    const point = toStockChartPoint(row);
    if (point) {
      points.push(point);
    }
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

function toStockChartPoint(row: FmpHistoricalPrice): StockChartPoint | null {
  if (!row.date) {
    return null;
  }

  const open = Number(row.open);
  const high = Number(row.high);
  const low = Number(row.low);
  const close = Number(row.close);
  const volume = Number(row.volume);

  if (
    !Number.isFinite(open) ||
    !Number.isFinite(high) ||
    !Number.isFinite(low) ||
    !Number.isFinite(close) ||
    !Number.isFinite(volume)
  ) {
    return null;
  }

  return { date: row.date, open, high, low, close, volume };
}
