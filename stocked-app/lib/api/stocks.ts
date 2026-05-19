import { authenticatedRequest } from "@/lib/api/authenticated";
import type { ChartRange, StockChart, StockQuote } from "@/lib/api/types";

export function getWatchedStocks(): Promise<StockQuote[]> {
  return authenticatedRequest<StockQuote[]>("/stocks/watched");
}

export function getPopularStocks(): Promise<StockQuote[]> {
  return authenticatedRequest<StockQuote[]>("/stocks/popular");
}

export function searchStocks(query: string): Promise<StockQuote[]> {
  const params = new URLSearchParams({ q: query });
  return authenticatedRequest<StockQuote[]>(`/stocks?${params.toString()}`);
}

export function getStock(symbol: string): Promise<StockQuote> {
  return authenticatedRequest<StockQuote>(
    `/stocks/${encodeURIComponent(symbol)}`,
  );
}

export function getStockChart(
  symbol: string,
  range: ChartRange,
): Promise<StockChart> {
  const params = new URLSearchParams({ range });
  return authenticatedRequest<StockChart>(
    `/stocks/${encodeURIComponent(symbol)}/chart?${params.toString()}`,
  );
}
