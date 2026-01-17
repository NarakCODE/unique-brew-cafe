import { User } from "./profile";

export interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  statusCode: number;
  data: AuthResponseData;
  message: string;
  success: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LogoutPayload {
  refreshToken: string;
}

export interface LogoutResponse {
  statusCode: number;
  data: {
    message: string;
  };
  message: string;
  success: boolean;
}

export interface ProfileResponse {
  statusCode: number;
  data: User;
  message: string;
  success: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResponse {
  statusCode: number;
  data: {
    message: string;
    email: string;
    otpExpiresAt: string;
  };
  message: string;
  success: boolean;
}

export interface VerifyOtpPayload {
  email: string;
  otpCode: string;
  fullName?: string;
  password?: string;
}

export interface VerifyOtpResponse {
  statusCode: number;
  data: AuthResponseData;
  message: string;
  success: boolean;
}

export interface ResendOtpPayload {
  email: string;
  verificationType: "registration" | "password_reset";
}

export interface ResendOtpResponse {
  statusCode: number;
  data: {
    message: string;
    otpExpiresAt: string;
  };
  message: string;
  success: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  statusCode: number;
  data: {
    message: string;
    otpExpiresAt: string;
  };
  message: string;
  success: boolean;
}

export interface ResetPasswordPayload {
  email: string;
  otpCode: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  statusCode: number;
  data: {
    message: string;
  };
  message: string;
  success: boolean;
}
