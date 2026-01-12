import { useQuery } from "@tanstack/react-query";
import { getAnnouncements } from "@/api/announcement";
import { ApiErrorResponse } from "@/types/api";

export function useAnnouncements() {
  const query = useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncements,
  });

  return {
    announcements: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}
