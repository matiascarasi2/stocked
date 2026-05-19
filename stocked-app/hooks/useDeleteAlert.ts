import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAlert } from "@/lib/api/alerts";

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAlert(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.removeQueries({ queryKey: ["alerts", id] });
      void queryClient.invalidateQueries({ queryKey: ["stocks", "watched"] });
    },
  });
}
