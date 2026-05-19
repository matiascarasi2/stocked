import { useQuery } from "@tanstack/react-query";

import { getStock } from "@/lib/api/stocks";

export function useStock(symbol: string) {
  return useQuery({
    queryKey: ["stocks", symbol],
    queryFn: () => getStock(symbol),
    enabled: Boolean(symbol),
  });
}
