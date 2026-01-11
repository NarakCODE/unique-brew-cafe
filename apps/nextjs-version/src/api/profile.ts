import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { UpdateProfileSettingsRequest, User } from "@/types/profile";

// Get user profile
export const getProfile = async (): Promise<ApiResponse<User>> => {
  return apiClient.get("/profile");
};

// Upload profile image
export const updateProfileImage = async (
  file: File
): Promise<ApiResponse<{ profileImage: string }>> => {
  const formData = new FormData();
  formData.append("image", file);

  return apiClient.post("/profile/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Edit profile settings
export const updateProfileSettingsFn = async (
  request: UpdateProfileSettingsRequest
): Promise<ApiResponse<User>> => {
  return apiClient.put("/profile", request);
};
