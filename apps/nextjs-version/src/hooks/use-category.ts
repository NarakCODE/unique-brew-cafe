import { useQuery } from "@tanstack/react-query";
import { getCategory } from "@/api/categories";

export const useCategory = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id),
    enabled: !!id && enabled,
  });
};
