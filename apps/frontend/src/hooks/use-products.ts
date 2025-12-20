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
