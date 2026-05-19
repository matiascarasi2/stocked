import { useQuery } from "@tanstack/react-query";

import { getWatchedStocks } from "@/lib/api/stocks";

export function useWatchedStocks() {
  return useQuery({
    queryKey: ["stocks", "watched"],
    queryFn: getWatchedStocks,
  });
}
