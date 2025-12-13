import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateStoreData, UpdateStoreData } from "@/types";
import { toast } from "sonner";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const storeKeys = {
    all: ["stores"] as const,
    list: (filters?: Record<string, unknown>) =>
        [...storeKeys.all, "list", filters] as const,
    adminList: (filters?: Record<string, unknown>) =>
        [...storeKeys.all, "admin-list", filters] as const,
    detail: (id: string) => [...storeKeys.all, "detail", id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all stores (Admin)
 */
export function useAdminStores(params?: {
    page?: number;
    limit?: number;
    city?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) {
    return useQuery({
        queryKey: storeKeys.adminList(params),
        queryFn: () => api.stores.adminList(params),
    });
}

/**
 * Get single store
 */
export function useStore(id: string) {
    return useQuery({
        queryKey: storeKeys.detail(id),
        queryFn: () => api.stores.get(id),
        enabled: !!id,
    });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create store
 */
export function useCreateStore() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStoreData) => api.stores.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: storeKeys.all });
            toast.success("Store created successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create store");
        },
    });
}

/**
 * Update store
 */
export function useUpdateStore() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStoreData }) =>
            api.stores.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: storeKeys.all });
            queryClient.invalidateQueries({
                queryKey: storeKeys.detail(data.id),
            });
            toast.success("Store updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update store");
        },
    });
}

/**
 * Delete store
 */
export function useDeleteStore() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.stores.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: storeKeys.all });
            toast.success("Store deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete store");
        },
    });
}

/**
 * Toggle store status
 */
export function useToggleStoreStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.stores.toggleStatus(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: storeKeys.all });
            queryClient.invalidateQueries({
                queryKey: storeKeys.detail(data.id),
            });
            toast.success("Store status updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update store status");
        },
    });
}
