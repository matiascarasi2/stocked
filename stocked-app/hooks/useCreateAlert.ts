import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAlert } from "@/lib/api/alerts";
import type { CreateAlertBody } from "@/lib/api/types";

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAlertBody) => createAlert(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["stocks", "watched"] });
    },
  });
}
