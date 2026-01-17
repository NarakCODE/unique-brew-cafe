import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStoreStatus } from "@/api/store";
import { toast } from "sonner";

export function useUpdateStoreStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateStoreStatus(id, isActive),
    onSuccess: (data) => {
      toast.success(
        `Store ${data.isActive ? "activated" : "deactivated"} successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["store", data._id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update store status");
    },
  });
}
