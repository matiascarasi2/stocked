import { useQuery } from "@tanstack/react-query";

import { listAlerts } from "@/lib/api/alerts";

export function useAlerts(includeInactive = false) {
  return useQuery({
    queryKey: ["alerts", { includeInactive }],
    queryFn: () => listAlerts({ includeInactive }),
  });
}
