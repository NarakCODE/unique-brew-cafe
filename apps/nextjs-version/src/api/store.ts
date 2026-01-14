import { apiClient } from "@/lib/api-client";
import {
  GetStoresResponse,
  StoreFilters,
  Store,
  CreateStorePayload,
} from "@/types/store";

export const getStores = async (
  filters?: StoreFilters
): Promise<GetStoresResponse> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
  if (filters?.isActive !== undefined)
    params.append("isActive", filters.isActive.toString());
  if (filters?.city) params.append("city", filters.city);

  return apiClient.get(`/stores?${params.toString()}`);
};

export const getStore = async (id: string): Promise<Store> => {
  const response = await apiClient.get<{ data: Store }>(`/stores/${id}`);
  return response.data;
};

export const createStore = async (data: CreateStorePayload): Promise<Store> => {
  return apiClient.post("/stores", data);
};

export const updateStore = async (
  id: string,
  data: Partial<CreateStorePayload>
): Promise<Store> => {
  return apiClient.patch(`/stores/${id}`, data);
};

export const deleteStore = async (id: string): Promise<void> => {
  return apiClient.delete(`/stores/${id}`);
};
