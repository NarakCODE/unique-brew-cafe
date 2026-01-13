import { useQuery } from "@tanstack/react-query";
import { getAnnouncements, getAnnouncement } from "@/api/announcement";
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

export function useAnnouncement(id: string | null) {
  const query = useQuery({
    queryKey: ["announcement", id],
    queryFn: () => getAnnouncement(id!),
    enabled: !!id,
  });

  return {
    announcement: query.data?.data,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
  };
}
