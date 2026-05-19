import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { searchStocks } from "@/lib/api/stocks";

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_MS = 300;

export function useStockSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const isSearching = debouncedQuery.length >= MIN_SEARCH_LENGTH;

  const result = useQuery({
    queryKey: ["stocks", "search", debouncedQuery],
    queryFn: () => searchStocks(debouncedQuery),
    enabled: isSearching,
  });

  return {
    ...result,
    debouncedQuery,
    isSearching,
  };
}
