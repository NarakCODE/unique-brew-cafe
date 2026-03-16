import { useQuery } from "@tanstack/react-query";

import { getStores } from "@/services/store.service";

type UseStoresParams = {
  search?: string;
};

export function useStores({ search }: UseStoresParams = {}) {
  const normalizedSearch = search?.trim() ?? "";

  return useQuery({
    queryKey: ["stores", { search: normalizedSearch || null }],
    queryFn: () =>
      getStores({
        search: normalizedSearch || undefined,
      }),
    staleTime: 1000 * 30,
    placeholderData: (previousData) => previousData,
  });
}
