import { NotFoundError } from "./stocks.errors.js";
import { StocksRepository } from "./stocks.repository.js";
import type {
  ChartRange,
  FinnhubQuote,
  FinnhubStockSymbol,
  FinnhubSymbolLookupInfo,
  StockChart,
} from "./stocks.types.js";

export type StockQuote = {
  id: string;
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  changePercent?: number;
};

const COMMON_STOCK_TYPE = "Common Stock";

const POPULAR_SYMBOLS = [
  "AAPL",
  "GOOGL",
  "MSFT",
  "AMZN",
  "TSLA",
  "META",
  "NVDA",
  "NFLX",
] as const;

export class StocksService {
  constructor(private readonly repository = new StocksRepository()) {}

  async searchStocks(query: string): Promise<StockQuote[]> {
    const response = await this.repository.searchSymbols(query);
    const quotes = response.result
      .filter((row) => row.type === COMMON_STOCK_TYPE)
      .map(toStockQuote);

    return dedupeStockQuotes(quotes);
  }

  async listWatchedStocks(userId: string): Promise<StockQuote[]> {
    const alertSymbols = await this.repository.getDistinctAlertSymbols(userId);
    if (alertSymbols.length === 0) {
      return [];
    }

    const usSymbols = await this.repository.getUsSymbols();
    const symbolMap = buildSymbolMap(usSymbols);

    const quotes: StockQuote[] = [];

    for (const alertSymbol of alertSymbols) {
      const match = symbolMap.get(alertSymbol.toUpperCase());
      if (!match) {
        continue;
      }

      quotes.push(toStockQuote(match));
    }

    return enrichStockQuotes(dedupeStockQuotes(quotes), this.repository);
  }

  async listPopularStocks(): Promise<StockQuote[]> {
    const usSymbols = await this.repository.getUsSymbols();
    const symbolMap = buildSymbolMap(usSymbols);

    const baseQuotes: StockQuote[] = [];

    for (const symbol of POPULAR_SYMBOLS) {
      const match = symbolMap.get(symbol);
      if (!match) {
        continue;
      }

      baseQuotes.push(toStockQuote(match));
    }

    return enrichStockQuotes(baseQuotes, this.repository);
  }

  async getStock(symbol: string): Promise<StockQuote> {
    const symbols = await this.repository.getUsSymbols();
    const match = symbols.find(
      (row) =>
        row.displaySymbol.toUpperCase() === symbol ||
        row.symbol.toUpperCase() === symbol,
    );

    if (!match) {
      throw new NotFoundError(`Stock not found: ${symbol}`);
    }

    return toStockQuote(match);
  }

  async getStockChart(symbol: string, range: ChartRange): Promise<StockChart> {
    const stock = await this.getStock(symbol);
    const { from, to } = resolveChartDateRange(range);

    const points = await this.repository.getHistoricalPrices(
      stock.symbol,
      from,
      to,
    );

    return {
      symbol: stock.symbol,
      range,
      points,
    };
  }
}

const CHART_RANGE_DAYS: Record<ChartRange, number> = {
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
};

function resolveChartDateRange(range: ChartRange): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - CHART_RANGE_DAYS[range]);

  return {
    from: formatDateUtc(from),
    to: formatDateUtc(to),
  };
}

function formatDateUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildSymbolMap(
  symbols: FinnhubStockSymbol[],
): Map<string, FinnhubStockSymbol> {
  const map = new Map<string, FinnhubStockSymbol>();

  for (const row of symbols) {
    map.set(row.symbol.toUpperCase(), row);
    map.set(row.displaySymbol.toUpperCase(), row);
  }

  return map;
}

function dedupeStockQuotes(quotes: StockQuote[]): StockQuote[] {
  const seen = new Set<string>();
  const deduped: StockQuote[] = [];

  for (const quote of quotes) {
    const key = quote.symbol.toUpperCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(quote);
  }

  return deduped;
}

function toStockQuote(
  row: FinnhubStockSymbol | FinnhubSymbolLookupInfo,
): StockQuote {
  const symbol = row.displaySymbol || row.symbol;

  return {
    id: symbol.toLowerCase(),
    symbol,
    name: row.description,
  };
}

async function enrichStockQuotes(
  stocks: StockQuote[],
  repository: StocksRepository,
): Promise<StockQuote[]> {
  return Promise.all(
    stocks.map((stock) => enrichWithQuote(stock, repository)),
  );
}

async function enrichWithQuote(
  stock: StockQuote,
  repository: StocksRepository,
): Promise<StockQuote> {
  let quote: FinnhubQuote;

  try {
    quote = await repository.getQuote(stock.symbol);
  } catch {
    return stock;
  }

  const priceFields = mapFinnhubQuote(quote);
  if (!priceFields) {
    return stock;
  }

  return { ...stock, ...priceFields };
}

function mapFinnhubQuote(
  quote: FinnhubQuote,
): Pick<StockQuote, "price" | "change" | "changePercent"> | null {
  const price = Number(quote.c);
  const change = Number(quote.d);
  const changePercent = Number(quote.dp);

  if (
    !Number.isFinite(price) ||
    price === 0 ||
    !Number.isFinite(change) ||
    !Number.isFinite(changePercent)
  ) {
    return null;
  }

  return { price, change, changePercent };
}
