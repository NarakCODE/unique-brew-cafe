import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
    CreateProductData,
    UpdateProductData,
    ProductFilters,
    PaginationParams,
} from "@/types";

export const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: (params: PaginationParams & ProductFilters) =>
        [...productKeys.lists(), params] as const,
    details: () => [...productKeys.all, "detail"] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProducts(params?: PaginationParams & ProductFilters) {
    return useQuery({
        queryKey: productKeys.list(params || {}),
        queryFn: () => api.products.list(params),
    });
}

export function useProduct(id: string) {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => api.products.get(id),
        enabled: !!id,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: FormData | CreateProductData) =>
            api.products.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            toast.success("Product created successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create product");
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: FormData | UpdateProductData;
        }) => api.products.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(data.id),
            });
            toast.success("Product updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update product");
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.products.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            toast.success("Product deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete product");
        },
    });
}

export function useUpdateProductStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            isAvailable,
        }: {
            id: string;
            isAvailable: boolean;
        }) => api.products.updateStatus(id, isAvailable),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: productKeys.detail(data.id),
            });
            toast.success(
                `Product is now ${data.isAvailable ? "available" : "unavailable"}`
            );
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update product status");
        },
    });
}

export function useDuplicateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => api.products.duplicate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            toast.success("Product duplicated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to duplicate product");
        },
    });
}

/**
 * Search products
 */
export function useSearchProducts(params: {
    q: string;
    page?: number;
    limit?: number;
    categoryId?: string;
    isFeatured?: boolean;
    isBestSelling?: boolean;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) {
    return useQuery({
        queryKey: [...productKeys.all, "search", params] as const,
        queryFn: () => api.products.search(params),
        enabled: !!params.q,
    });
}

/**
 * Get product by slug
 */
export function useProductBySlug(slug: string) {
    return useQuery({
        queryKey: [...productKeys.all, "slug", slug] as const,
        queryFn: () => api.products.getBySlug(slug),
        enabled: !!slug,
    });
}

/**
 * Get product customizations
 */
export function useProductCustomizations(productId: string) {
    return useQuery({
        queryKey: [...productKeys.all, "customizations", productId] as const,
        queryFn: () => api.products.getCustomizations(productId),
        enabled: !!productId,
    });
}

/**
 * Get product add-ons
 */
export function useProductAddOns(productId: string) {
    return useQuery({
        queryKey: [...productKeys.all, "addons", productId] as const,
        queryFn: () => api.products.getAddOns(productId),
        enabled: !!productId,
    });
}
