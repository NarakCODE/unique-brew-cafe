import { apiClient } from "@/lib/api-client";
import {
  GetStoresResponse,
  PublicStoreFilters,
  StoreFilters,
  Store,
  CreateStorePayload,
  GetPickupTimesResponse,
  GetStoreHoursResponse,
} from "@/types/store";
import { buildQueryString, withQuery } from "@/lib/search-params";

export const getStores = async (
  filters?: StoreFilters
): Promise<GetStoresResponse> => {
  const query = buildQueryString({
    search: filters?.search,
    page: filters?.page,
    limit: filters?.limit,
    sortOrder: filters?.sortOrder,
    isActive: filters?.isActive,
    city: filters?.city,
  });

  return apiClient.get(
    withQuery("/stores/admin/all", query)
  ) as Promise<GetStoresResponse>;
};

export const getPublicStores = async (
  filters?: PublicStoreFilters
): Promise<GetStoresResponse> => {
  const query = buildQueryString({
    city: filters?.city,
    latitude: filters?.latitude,
    longitude: filters?.longitude,
    radius: filters?.radius,
    page: filters?.page,
    limit: filters?.limit,
    sortBy: filters?.sortBy,
    sortOrder: filters?.sortOrder,
  });

  return apiClient.get(
    withQuery("/stores", query)
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
