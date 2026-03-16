import { useQuery } from "@tanstack/react-query";

import { getStoreById } from "@/services/store.service";

export function useStore(id?: string) {
  return useQuery({
    queryKey: ["store", id],
    queryFn: () => getStoreById(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}
