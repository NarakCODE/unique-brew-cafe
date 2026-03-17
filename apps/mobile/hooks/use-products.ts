import { useQuery } from "@tanstack/react-query";
import type { ProductFilters } from "../../../packages/api/src";

import { getProducts } from "@/services/product.service";

type UseProductsParams = ProductFilters;

export function useProducts(filters: UseProductsParams = {}) {
  const normalizedSearch = filters.search?.trim() ?? "";
  const normalizedTags = Array.isArray(filters.tags)
    ? filters.tags.filter(Boolean)
    : filters.tags
      ? [filters.tags]
      : [];

  return useQuery({
    queryKey: [
      "products",
      {
        page: filters.page ?? null,
        limit: filters.limit ?? 100,
        storeId: filters.storeId ?? null,
        search: normalizedSearch || null,
        categoryId: filters.categoryId ?? null,
        isAvailable: filters.isAvailable ?? null,
        isFeatured: filters.isFeatured ?? null,
        isBestSelling: filters.isBestSelling ?? null,
        tags: normalizedTags,
        minPrice: filters.minPrice ?? null,
        maxPrice: filters.maxPrice ?? null,
        sortBy: filters.sortBy ?? null,
        sortOrder: filters.sortOrder ?? null,
      },
    ],
    queryFn: () =>
      getProducts({
        ...filters,
        limit: filters.limit ?? 100,
        search: normalizedSearch || undefined,
        tags: normalizedTags.length ? normalizedTags : undefined,
      }),
    staleTime: 1000 * 30,
    placeholderData: (previousData) => previousData,
  });
}
