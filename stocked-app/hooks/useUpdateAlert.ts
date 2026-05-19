import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAlert } from "@/lib/api/alerts";
import type { UpdateAlertBody } from "@/lib/api/types";

type UpdateAlertVariables = {
  id: string;
  body: UpdateAlertBody;
};

export function useUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: UpdateAlertVariables) => updateAlert(id, body),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["alerts", id] });
      void queryClient.invalidateQueries({ queryKey: ["stocks", "watched"] });
    },
  });
}
