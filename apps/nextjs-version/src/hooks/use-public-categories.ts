import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/api/categories";
import { ApiErrorResponse } from "@/types/api";

export function usePublicCategories() {
  const query = useQuery({
    queryKey: ["public-categories"],
    queryFn: getCategories,
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
    refetch: query.refetch,
  };
}
