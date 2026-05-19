import type { Request } from "express";
import { ValidationError } from "./stocks.errors.js";
import type { ChartRange } from "./stocks.types.js";

const CHART_RANGES = new Set<ChartRange>(["1M", "3M", "6M", "1Y"]);

const SYMBOL_PATTERN = /^[A-Z0-9.-]+$/;

export type SearchStocksQuery = {
  q: string;
};

export function parseSearchStocksQuery(query: Request["query"]): SearchStocksQuery {
  const raw = query.q;
  if (typeof raw !== "string" || !raw.trim()) {
    throw new ValidationError("q is required");
  }

  const trimmed = raw.trim();
  if (trimmed.length < 2) {
    throw new ValidationError("q must be at least 2 characters");
  }

  return { q: trimmed };
}

export function parseSymbolParam(params: Request["params"]): string {
  const raw = params.symbol;
  if (!raw?.trim()) {
    throw new ValidationError("symbol is required");
  }

  const symbol = raw.trim().toUpperCase();
  if (!SYMBOL_PATTERN.test(symbol)) {
    throw new ValidationError("symbol is invalid");
  }

  return symbol;
}

export type ChartQuery = {
  range: ChartRange;
};

export function parseChartQuery(query: Request["query"]): ChartQuery {
  const raw = query.range;
  if (typeof raw !== "string" || !raw.trim()) {
    throw new ValidationError("range is required");
  }

  const range = raw.trim().toUpperCase();
  if (!CHART_RANGES.has(range as ChartRange)) {
    throw new ValidationError("range must be one of: 1M, 3M, 6M, 1Y");
  }

  return { range: range as ChartRange };
}
