import { apiClient } from "@/lib/api-client";
import { Category, GetCategoriesResponse } from "@/types/category";

export const getCategories = async (): Promise<Category[]> => {
  // The interceptor returns the response body (GetCategoriesResponse)
  const response = await apiClient.get<GetCategoriesResponse>("/categories");
  // We want to return the array of categories
  // @ts-expect-error - we know the structure
  return response.data;
};

export const getCategory = async (id: string): Promise<Category> => {
  const response = await apiClient.get<{ data: Category }>(`/categories/${id}`);
  // @ts-expect-error - Interceptor returns data directly
  return response.data;
};
