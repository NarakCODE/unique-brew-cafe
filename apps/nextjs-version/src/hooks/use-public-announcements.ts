import { useQuery } from "@tanstack/react-query";
import { getPublicAnnouncements } from "@/api/announcement";
import { ApiErrorResponse } from "@/types/api";

export function usePublicAnnouncements() {
  const query = useQuery({
    queryKey: ["public-announcements"],
    queryFn: getPublicAnnouncements,
  });

  return {
    announcements: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
    refetch: query.refetch,
  };
}
