import { apiClient } from "@/lib/api-client"
import { ApiResponse, ApiErrorResponse } from "@/types/api"
import { User } from "@/types/auth"

export const getProfile = async (): Promise<ApiResponse<User>> => {
  return apiClient.get("/profile")
}

export const updateProfileImage = async (
  file: File
): Promise<ApiResponse<{ profileImage: string }>> => {
  const formData = new FormData()
  formData.append("image", file)

  return apiClient.post("/profile/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}
