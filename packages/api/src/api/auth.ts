import { ApiResponse } from '../types/api';
import { AuthResponse, LoginInput } from '../types/auth';

export const createAuthApi = (apiClient: {
  get: <T = any, R = T>(url: string, config?: any) => Promise<R>;
  post: <T = any, R = T>(url: string, data?: any, config?: any) => Promise<R>;
  put: <T = any, R = T>(url: string, data?: any, config?: any) => Promise<R>;
  delete: <T = any, R = T>(url: string, config?: any) => Promise<R>;
}) => {
  return {
    login: async (request: LoginInput): Promise<ApiResponse<AuthResponse>> => {
      // Use standard apiClient approach
      return apiClient.post<unknown, ApiResponse<AuthResponse>>('/auth/login', request);
    },
    // Other auth endpoints can be mapped here similarly when needed
  };
};
