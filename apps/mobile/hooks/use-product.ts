import { useQuery } from "@tanstack/react-query";

import { getProductById } from "@/services/product.service";

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}
