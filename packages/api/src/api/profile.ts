import { ApiResponse } from "../types/api";
import {
  ChangePasswordRequest,
  DeleteAccountRequest,
  UpdateProfileSettingsRequest,
  User,
} from "../types/profile";

export const createProfileApi = (apiClient: {
  get: <T = any, R = T>(url: string, config?: any) => Promise<R>;
  post: <T = any, R = T>(url: string, data?: any, config?: any) => Promise<R>;
  put: <T = any, R = T>(url: string, data?: any, config?: any) => Promise<R>;
  delete: <T = any, R = T>(url: string, config?: any) => Promise<R>;
}) => {
  return {
    getProfile: async (): Promise<ApiResponse<User>> => {
      return apiClient.get<unknown, ApiResponse<User>>("/profile");
    },
    updateProfileImage: async (
      // any to accommodate both Blob and React Native FormData parts
      formData: any
    ): Promise<ApiResponse<{ profileImage: string }>> => {
      return apiClient.post<unknown, ApiResponse<{ profileImage: string }>>("/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    updateProfileSettingsFn: async (
      request: UpdateProfileSettingsRequest
    ): Promise<ApiResponse<User>> => {
      return apiClient.put<unknown, ApiResponse<User>>("/profile", request);
    },
    changePassword: async (
      request: ChangePasswordRequest
    ): Promise<ApiResponse<void>> => {
      return apiClient.put<unknown, ApiResponse<void>>("/profile/password", request);
    },
    deleteAccount: async (
      request: DeleteAccountRequest
    ): Promise<ApiResponse<void>> => {
      return apiClient.delete<unknown, ApiResponse<void>>("/profile", { data: request });
    },
  };
};
