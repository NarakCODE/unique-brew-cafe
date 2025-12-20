import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateCategoryData, UpdateCategoryData } from "@/types";
import { toast } from "sonner";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const categoryKeys = {
    all: ["categories"] as const,
    list: (filters?: Record<string, unknown>) =>
        [...categoryKeys.all, "list", filters] as const,
    detail: (id: string) => [...categoryKeys.all, "detail", id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all categories
 */
export function useCategories(params?: {
    page?: number;
    limit?: number;
    storeId?: string;
    isActive?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) {
    return useQuery({
        queryKey: categoryKeys.list(params),
        queryFn: () => api.categories.list(params),
    });
}

/**
 * Get single category
 */
export function useCategory(id: string) {
    return useQuery({
        queryKey: categoryKeys.detail(id),
        queryFn: () => api.categories.get(id),
        enabled: !!id,
    });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create category
 */
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryData) => api.categories.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            toast.success("Category created successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create category");
        },
    });
}

/**
 * Update category
 */
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
            api.categories.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            queryClient.invalidateQueries({
                queryKey: categoryKeys.detail(data.id),
            });
            toast.success("Category updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update category");
        },
    });
}

/**
 * Delete category
 */
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.categories.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            toast.success("Category deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete category");
        },
    });
}
