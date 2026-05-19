import type { StockChartPoint } from "@/lib/api/types";

const X_AXIS_LABEL_COUNT = 4;

export type StockChartDataItem = {
  value: number;
  date: string;
};

export type GiftedChartData = {
  data: StockChartDataItem[];
  xAxisLabelTexts: string[];
};

function formatAxisDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatShortAxisDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function pickLabelIndices(length: number, count: number): Set<number> {
  if (length === 0) {
    return new Set();
  }
  if (length === 1) {
    return new Set([0]);
  }

  const indices = new Set<number>();
  const step = (length - 1) / (count - 1);

  for (let i = 0; i < count; i++) {
    indices.add(Math.round(i * step));
  }

  return indices;
}

export function toGiftedChartData(points: StockChartPoint[]): GiftedChartData {
  const labelIndices = pickLabelIndices(points.length, X_AXIS_LABEL_COUNT);

  const data = points.map((point) => ({
    value: point.close,
    date: point.date,
  }));

  const xAxisLabelTexts = points.map((point, index) =>
    labelIndices.has(index) ? formatShortAxisDate(point.date) : "",
  );

  return { data, xAxisLabelTexts };
}

export { formatAxisDate };
