import { apiClient } from "@/lib/api-client";
import {
  GetUsersResponse,
  UserFilters,
  GetUserResponse,
  UpdateUserStatusRequest,
  UpdateUserStatusResponse,
} from "@/types/user";
import { buildQueryString, withQuery } from "@/lib/search-params";

export const getUsers = async (
  filters?: UserFilters
): Promise<GetUsersResponse> => {
  const query = buildQueryString({
    role: filters?.role,
    status: filters?.status,
    search: filters?.search,
    page: filters?.page,
    limit: filters?.limit,
  });

  return apiClient.get(withQuery("/users", query));
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
