import type { StockChartPoint } from "@/lib/api/types";

const X_AXIS_LABEL_COUNT = 4;

export type StockChartDataItem = {
  value: number;
  date: string;
};

export type ChartXAxisTick = {
  index: number;
  label: string;
};

export type GiftedChartData = {
  data: StockChartDataItem[];
  xAxisTicks: ChartXAxisTick[];
};

function formatAxisDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getChartPlotWidth(
  chartWidth: number,
  yAxisLabelWidth: number,
): number {
  return Math.max(chartWidth - yAxisLabelWidth, 0);
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

  const xAxisTicks = [...labelIndices]
    .sort((a, b) => a - b)
    .map((index) => ({
      index,
      label: formatAxisDate(points[index]!.date),
    }));

  return { data, xAxisTicks };
}

export { formatAxisDate };
