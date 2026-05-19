import { useQuery } from "@tanstack/react-query";

import { getPopularStocks } from "@/lib/api/stocks";

export function usePopularStocks() {
  return useQuery({
    queryKey: ["stocks", "popular"],
    queryFn: getPopularStocks,
  });
}
