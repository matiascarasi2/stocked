export type FinnhubStockSymbol = {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
};

export type FinnhubSymbolLookupInfo = {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
};

export type FinnhubSymbolLookup = {
  count: number;
  result: FinnhubSymbolLookupInfo[];
};

export type FinnhubQuote = {
  c: number;
  d: number;
  dp: number;
  h?: number;
  l?: number;
  o?: number;
  pc?: number;
  t?: number;
};

export type ChartRange = "1M" | "3M" | "6M" | "1Y";

export type StockChartPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type StockChart = {
  symbol: string;
  range: ChartRange;
  points: StockChartPoint[];
};

export type FmpHistoricalPrice = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
