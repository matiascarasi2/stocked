import { useQuery } from "@tanstack/react-query";

import { getStockChart } from "@/lib/api/stocks";
import type { ChartRange } from "@/lib/api/types";

export function useStockChart(symbol: string, range: ChartRange) {
  return useQuery({
    queryKey: ["stocks", symbol, "chart", range],
    queryFn: () => getStockChart(symbol, range),
    enabled: Boolean(symbol),
  });
}
