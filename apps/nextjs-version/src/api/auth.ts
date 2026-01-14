import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import {
  ResendOtpPayload,
  ResendOtpResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "@/types/auth";

export const resendOtp = async (
  payload: ResendOtpPayload
): Promise<ResendOtpResponse> => {
  return apiClient.post("/auth/resend-otp", payload);
};

export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  return apiClient.post("/auth/forgot-password", payload);
};

export const resetPassword = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  return apiClient.post("/auth/reset-password", payload);
};

export const verifyOtp = async (
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> => {
  return apiClient.post("/auth/verify-otp", payload);
};
