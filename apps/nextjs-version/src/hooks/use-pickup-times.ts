import { useQuery } from "@tanstack/react-query";
import { getPickupTimes } from "@/api/store";

export function usePickupTimes(storeId: string | undefined) {
  return useQuery({
    queryKey: ["pickup-times", storeId],
    queryFn: () => getPickupTimes(storeId!),
    enabled: !!storeId,
  });
}
