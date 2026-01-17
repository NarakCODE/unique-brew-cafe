import { User } from "./profile";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetUsersResponse {
  statusCode: number;
  data: {
    data: User[];
    pagination: Pagination;
  };
  message: string;
  success: boolean;
}

export interface GetUserResponse {
  statusCode: number;
  data: User;
  message: string;
  success: boolean;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdateUserStatusRequest {
  status: "active" | "suspended" | string;
  reason?: string;
}

export interface UpdateUserStatusResponse {
  statusCode: number;
  data: User;
  message: string;
  success: boolean;
}
