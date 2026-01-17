import { useQuery } from "@tanstack/react-query";
import { getStoreHours } from "@/api/store";

export function useStoreHours(storeId: string | undefined) {
  return useQuery({
    queryKey: ["store-hours", storeId],
    queryFn: () => getStoreHours(storeId!),
    enabled: !!storeId,
  });
}
