import { apiClient } from "@/lib/api-client";
import { GetPublicConfigResponse } from "@/types/config";

export const getPublicConfig = async (): Promise<GetPublicConfigResponse> => {
  return apiClient.get("/config/app");
};
