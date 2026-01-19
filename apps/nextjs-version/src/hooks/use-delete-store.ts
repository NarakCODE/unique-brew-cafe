/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteStore } from "@/api/store";

export const useDeleteStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStore(id),
    onSuccess: () => {
      toast.success("Store deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete store");
    },
  });
};
