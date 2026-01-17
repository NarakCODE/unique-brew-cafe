import { apiClient } from "@/lib/api-client";
import {
  GetStoresResponse,
  StoreFilters,
  Store,
  CreateStorePayload,
  GetPickupTimesResponse,
  GetStoreHoursResponse,
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

  return apiClient.get(
    `/stores/admin/all?${params.toString()}`
  ) as Promise<GetStoresResponse>;
};

export const getStore = async (id: string): Promise<Store> => {
  const response = await apiClient.get<{ data: Store }>(`/stores/${id}`);
  // @ts-expect-error - Interceptor returns data directly
  return response.data;
};

export const createStore = async (data: CreateStorePayload): Promise<Store> => {
  return apiClient.post("/stores", data) as Promise<Store>;
};

export const updateStore = async (
  id: string,
  data: Partial<CreateStorePayload>
): Promise<Store> => {
  return apiClient.patch(`/stores/${id}`, data) as Promise<Store>;
};

export const deleteStore = async (id: string): Promise<void> => {
  return apiClient.delete(`/stores/${id}`);
};

export const getPickupTimes = async (
  id: string
): Promise<GetPickupTimesResponse> => {
  return apiClient.get<GetPickupTimesResponse>(
    `/stores/${id}/pickup-times`
  ) as unknown as Promise<GetPickupTimesResponse>;
};

export const getStoreHours = async (
  id: string
): Promise<GetStoreHoursResponse> => {
  return apiClient.get<GetStoreHoursResponse>(
    `/stores/${id}/hours`
  ) as unknown as Promise<GetStoreHoursResponse>;
};

export const updateStoreStatus = async (
  id: string,
  isActive: boolean
): Promise<Store> => {
  const response = await apiClient.patch<{ data: Store }>(
    `/stores/${id}/status`,
    { isActive }
  );
  // @ts-expect-error - Interceptor returns data directly
  return response.data;
};
