import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateStore } from "@/api/store";
import { CreateStorePayload } from "@/types/store";

export const useUpdateStore = (storeId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: Partial<CreateStorePayload>) =>
      updateStore(storeId, data),
    onSuccess: () => {
      toast.success("Store updated successfully");
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["store", storeId] });
      router.push("/stores");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update store");
    },
  });
};
