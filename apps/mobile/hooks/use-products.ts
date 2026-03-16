import { useQuery } from "@tanstack/react-query";

import { getCategoryProducts } from "@/services/category.service";
import { getProducts } from "@/services/product.service";

type UseProductsParams = {
  categoryId?: string;
  limit?: number;
};

export function useProducts({ categoryId, limit = 24 }: UseProductsParams = {}) {
  return useQuery({
    queryKey: ["products", { categoryId: categoryId ?? null, limit }],
    queryFn: () =>
      categoryId
        ? getCategoryProducts(categoryId, { limit })
        : getProducts({ limit }),
    staleTime: 1000 * 30,
  });
}
