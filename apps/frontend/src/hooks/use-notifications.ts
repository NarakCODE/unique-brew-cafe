/**
 * Notifications Hooks - Server State Management
 * Uses TanStack Query for server-side notifications
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const notificationKeys = {
    all: ["notifications"] as const,
    lists: () => [...notificationKeys.all, "list"] as const,
    list: (filters: NotificationFilters) =>
        [...notificationKeys.lists(), filters] as const,
};

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationFilters {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get user's notifications
 */
export function useNotifications(filters: NotificationFilters = {}) {
    return useQuery({
        queryKey: notificationKeys.list(filters),
        queryFn: () => api.notifications.list(filters),
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
    });
}

/**
 * Get unread notifications count
 */
export function useUnreadNotificationsCount() {
    const { data } = useNotifications({ unreadOnly: true, limit: 100 });

    return {
        count: data?.data?.length || 0,
        hasUnread: (data?.data?.length || 0) > 0,
    };
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mark notification as read
 */
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.notifications.markAsRead(id),
        onSuccess: () => {
            // Invalidate all notification queries
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => api.notifications.markAllAsRead(),
        onSuccess: () => {
            // Invalidate all notification queries
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.notifications.delete(id),
        onSuccess: () => {
            // Invalidate all notification queries
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}
