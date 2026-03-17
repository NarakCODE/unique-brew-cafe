import { useQuery } from "@tanstack/react-query";

import { getStores } from "@/services/store.service";

type UseStoresParams = {
  search?: string;
  limit?: number;
};

export function useStores({ search, limit }: UseStoresParams = {}) {
  const normalizedSearch = search?.trim() ?? "";

  return useQuery({
    queryKey: ["stores", { search: normalizedSearch || null, limit: limit ?? null }],
    queryFn: () =>
      getStores({
        search: normalizedSearch || undefined,
        limit,
      }),
    staleTime: 1000 * 30,
    placeholderData: (previousData) => previousData,
  });
}
