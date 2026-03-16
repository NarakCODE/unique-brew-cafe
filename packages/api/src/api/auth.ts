import { ApiResponse } from '../types/api';
import {
  AuthResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  InitiateRegistrationInput,
  LoginInput,
  LogoutInput,
  LogoutResponse,
  ResendOtpInput,
  ResendOtpResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
  VerifyOtpInput,
  VerifyOtpResponse,
  VerifyRegistrationInput,
  VerifyRegistrationResponse,
  RegistrationInitiationResponse,
} from '../types/auth';

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
    initiateRegistration: async (
      request: InitiateRegistrationInput
    ): Promise<RegistrationInitiationResponse> => {
      return apiClient.post<unknown, RegistrationInitiationResponse>(
        '/auth/register/initiate',
        request
      );
    },
    verifyRegistration: async (
      request: VerifyRegistrationInput
    ): Promise<VerifyRegistrationResponse> => {
      return apiClient.post<unknown, VerifyRegistrationResponse>(
        '/auth/register/verify',
        request
      );
    },
    forgotPassword: async (
      request: ForgotPasswordInput
    ): Promise<ForgotPasswordResponse> => {
      return apiClient.post<unknown, ForgotPasswordResponse>(
        '/auth/forgot-password',
        request
      );
    },
    resetPassword: async (
      request: ResetPasswordInput
    ): Promise<ResetPasswordResponse> => {
      return apiClient.post<unknown, ResetPasswordResponse>(
        '/auth/reset-password',
        request
      );
    },
    verifyOtp: async (request: VerifyOtpInput): Promise<VerifyOtpResponse> => {
      return apiClient.post<unknown, VerifyOtpResponse>('/auth/verify-otp', request);
    },
    resendOtp: async (request: ResendOtpInput): Promise<ResendOtpResponse> => {
      return apiClient.post<unknown, ResendOtpResponse>('/auth/resend-otp', request);
    },
    logout: async (request: LogoutInput): Promise<LogoutResponse> => {
      return apiClient.post<unknown, LogoutResponse>('/auth/logout', request);
    },
  };
};
