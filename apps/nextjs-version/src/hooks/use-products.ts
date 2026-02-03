/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  getProduct,
  getProducts,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "@/api/products";
import { ProductFilters, CreateProductPayload } from "@/types/product";
import { ApiErrorResponse } from "@/types/api";
import { toast } from "sonner";

export function useProducts(filters?: ProductFilters) {
  const query = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getAdminProducts(filters),
  });

  return {
    products: query.data?.data.data ?? [],
    pagination: query.data?.data.pagination,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useProduct(productId: string | null) {
  const query = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId!),
    enabled: !!productId,
  });

  return {
    product: query.data?.data,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct(productId: string) {
  const t = useTranslations("Products");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CreateProductPayload>) =>
      updateProduct(productId, payload),
    onSuccess: () => {
      toast.success(t("productUpdated"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("failedToUpdate"));
    },
  });
}

export function useDeleteProduct() {
  const t = useTranslations("Products");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      toast.success(t("productDeleted"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("failedToDelete"));
    },
  });
}

export function useUpdateProductStatus() {
  const t = useTranslations("Products");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      isAvailable,
    }: {
      productId: string;
      isAvailable: boolean;
    }) => updateProductStatus(productId, isAvailable),
    onSuccess: () => {
      toast.success(t("productStatusUpdated"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("failedToUpdateStatus"));
    },
  });
}
