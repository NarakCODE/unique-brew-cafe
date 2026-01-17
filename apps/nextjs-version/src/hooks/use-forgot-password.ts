import { useMutation } from "@tanstack/react-query";
import { forgotPassword, resetPassword, verifyOtp } from "@/api/auth";
import {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "@/types/auth";
import { AxiosError } from "axios";

export const useForgotPassword = () => {
  return useMutation<
    ForgotPasswordResponse,
    AxiosError<{ message: string }>,
    ForgotPasswordPayload
  >({
    mutationFn: forgotPassword,
  });
};

export const useVerifyOtpRequest = () => {
  return useMutation<
    VerifyOtpResponse,
    AxiosError<{ message: string }>,
    VerifyOtpPayload
  >({
    mutationFn: verifyOtp,
  });
};

export const useResetPassword = () => {
  return useMutation<
    ResetPasswordResponse,
    AxiosError<{ message: string }>,
    ResetPasswordPayload
  >({
    mutationFn: resetPassword,
  });
};
