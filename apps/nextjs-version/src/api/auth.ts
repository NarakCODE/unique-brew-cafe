import { apiClient } from "@/lib/api-client"
import { ApiResponse } from "@/types/api"
import { ResendOtpPayload, ResendOtpResponse } from "@/types/auth"

export const resendOtp = async (
  payload: ResendOtpPayload
): Promise<ResendOtpResponse> => {
  return apiClient.post("/auth/resend-otp", payload)
}
