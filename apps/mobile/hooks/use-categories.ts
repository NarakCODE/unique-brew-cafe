import { useQuery } from "@tanstack/react-query";

import { getCategories } from "@/services/category.service";

type UseCategoriesParams = {
  storeId?: string;
};

export function useCategories({ storeId }: UseCategoriesParams = {}) {
  return useQuery({
    queryKey: ["categories", { storeId: storeId ?? null }],
    queryFn: async () => {
      const categories = await getCategories();

      if (!storeId) {
        return categories;
      }

      return categories.filter((category) => category.storeId === storeId);
    },
    staleTime: 1000 * 60 * 5,
  });
}
