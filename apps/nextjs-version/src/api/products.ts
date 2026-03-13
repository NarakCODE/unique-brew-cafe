import { apiClient } from "@/lib/api-client";
import { createProductsApi } from "@unique-brew/api";

const productsApi = createProductsApi(apiClient);

export const {
  getProducts,
  getAdminProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} = productsApi;
