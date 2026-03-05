import { useQuery } from "@tanstack/react-query";
import { getPublicConfig } from "@/api/config";
import { ApiErrorResponse } from "@/types/api";

export function usePublicConfig() {
  const query = useQuery({
    queryKey: ["public-config"],
    queryFn: getPublicConfig,
  });

  return {
    config: query.data?.data ?? {},
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
    refetch: query.refetch,
  };
}
