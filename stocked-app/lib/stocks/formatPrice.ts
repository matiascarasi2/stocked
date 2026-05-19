import type { StockChartPoint } from "@/lib/api/types";

export type PriceSummary = {
  price: number;
  change: number | null;
  changePercent: number | null;
};

export function derivePriceSummary(
  points: StockChartPoint[],
): PriceSummary | null {
  if (points.length === 0) {
    return null;
  }

  const last = points[points.length - 1];

  if (points.length === 1) {
    return { price: last.close, change: null, changePercent: null };
  }

  const previous = points[points.length - 2];
  const change = last.close - previous.close;
  const changePercent = (change / previous.close) * 100;

  return { price: last.close, change, changePercent };
}

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatPriceChange(change: number, changePercent: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
}

export function formatChartYAxis(label: string): string {
  const value = Number(label);
  if (!Number.isFinite(value)) {
    return label;
  }

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }

  return `$${Math.round(value)}`;
}
