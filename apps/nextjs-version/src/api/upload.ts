import { apiClient } from "@/lib/api-client";

export interface UploadResponse {
  statusCode: number;
  data: {
    url: string;
    public_id: string;
    format: string;
    original_name: string;
    size: number;
  };
  message: string;
  success: boolean;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
