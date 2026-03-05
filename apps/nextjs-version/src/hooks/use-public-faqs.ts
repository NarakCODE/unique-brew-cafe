import { useQuery } from "@tanstack/react-query";
import { getFAQs } from "@/api/support";
import { FAQFilters } from "@/types/support";
import { ApiErrorResponse } from "@/types/api";

export function usePublicFaqs(filters?: FAQFilters) {
  const query = useQuery({
    queryKey: ["public-faqs", filters],
    queryFn: () => getFAQs(filters),
  });

  return {
    faqs: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
    refetch: query.refetch,
  };
}
