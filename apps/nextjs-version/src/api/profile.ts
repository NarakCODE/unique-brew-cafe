import { apiClient } from "@/lib/api-client";
import { createProfileApi } from "@unique-brew/api";

const profileApi = createProfileApi(apiClient);

export const {
  getProfile,
  updateProfileImage,
  updateProfileSettingsFn,
  changePassword,
  deleteAccount,
} = profileApi;
