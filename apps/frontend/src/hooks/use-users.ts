/**
 * User Hooks - Server State Management
 * Uses TanStack Query for user management (admin)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/types/user";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
    details: () => [...userKeys.all, "detail"] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};

// ============================================================================
// TYPES
// ============================================================================

export interface UserFilters {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get paginated list of users (Admin only)
 */
export function useUsers(filters: UserFilters = {}) {
    return useQuery({
        queryKey: userKeys.list(filters),
        queryFn: () => api.users.list(filters),
        staleTime: 60 * 1000, // 1 minute
        placeholderData: (previousData) => previousData,
    });
}

/**
 * Get single user by ID (Admin only)
 */
export function useUser(id: string | null) {
    return useQuery({
        queryKey: userKeys.detail(id!),
        queryFn: () => api.users.get(id!),
        enabled: !!id,
        staleTime: 60 * 1000,
    });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update user (Admin only)
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
            api.users.update(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate user detail
            queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
            // Invalidate all user lists
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
}

/**
 * Delete user (Admin only)
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.users.delete(id),
        onSuccess: () => {
            // Invalidate all user lists
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
}

/**
 * Update user role (Admin only)
 */
export function useUpdateUserRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, role }: { id: string; role: string }) =>
            api.users.updateRole(id, role),
        onSuccess: (_, { id }) => {
            // Invalidate user detail
            queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
            // Invalidate all user lists
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
}
