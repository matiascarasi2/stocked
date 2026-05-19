import { useQuery } from "@tanstack/react-query";

import { getAlert } from "@/lib/api/alerts";

export function useAlert(id: string) {
  return useQuery({
    queryKey: ["alerts", id],
    queryFn: () => getAlert(id),
    enabled: Boolean(id),
  });
}
