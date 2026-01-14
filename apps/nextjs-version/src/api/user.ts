import { apiClient } from "@/lib/api-client";
import {
  GetUsersResponse,
  UserFilters,
  GetUserResponse,
  UpdateUserStatusRequest,
  UpdateUserStatusResponse,
} from "@/types/user";

export const getUsers = async (
  filters?: UserFilters
): Promise<GetUsersResponse> => {
  const params = new URLSearchParams();
  if (filters?.role) params.append("role", filters.role);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  return apiClient.get(`/users?${params.toString()}`);
};

export const getUser = async (userId: string): Promise<GetUserResponse> => {
  return apiClient.get(`/users/${userId}`);
};

export const updateUserStatus = async (
  userId: string,
  data: UpdateUserStatusRequest
): Promise<UpdateUserStatusResponse> => {
  return apiClient.patch(`/users/${userId}/status`, data);
};
