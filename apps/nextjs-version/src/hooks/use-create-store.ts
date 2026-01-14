import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createStore } from "@/api/store";
import { Store } from "@/types/store";

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: any) => createStore(data),
    onSuccess: () => {
      toast.success("Store created successfully");
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      router.push("/stores");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create store");
    },
  });
};
