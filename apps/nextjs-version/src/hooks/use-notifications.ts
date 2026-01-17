import { useQuery } from "@tanstack/react-query";
import {
  getNotifications,
  getNotificationStats,
  getUnreadNotificationCount,
} from "@/api/notification";
import { ApiErrorResponse } from "@/types/api";

export function useNotifications() {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  return {
    notifications: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useUnreadNotificationCount() {
  const query = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: getUnreadNotificationCount,
    // Refetch every minute directly to keep the count updated
    refetchInterval: 60000,
  });

  return {
    count: query.data?.data.count ?? 0,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useNotificationStats() {
  const query = useQuery({
    queryKey: ["notifications-stats"],
    queryFn: getNotificationStats,
  });

  return {
    stats: query.data?.data,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}
