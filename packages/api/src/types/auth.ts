import { User } from './profile';
import { ApiResponse } from './api';

export type VerificationType = "registration" | "password_reset";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LogoutInput {
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type LoginResponse = ApiResponse<AuthResponse>;
export type LogoutResponse = ApiResponse<{
  message: string;
}>;

export interface InitiateRegistrationInput {
  fullName: string;
  email: string;
  password: string;
}

export interface VerifyRegistrationInput {
  fullName: string;
  email: string;
  password: string;
  otpCode: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otpCode: string;
  newPassword: string;
}

export interface ResendOtpInput {
  email: string;
  verificationType: VerificationType;
}

export interface VerifyOtpInput {
  email: string;
  otpCode: string;
  verificationType?: VerificationType;
}

export interface RegistrationInitiationResult {
  message: string;
  email: string;
  otpExpiresAt: string;
}

export interface GenericMessageResult {
  message: string;
}

export interface AuthVerificationResult extends AuthResponse {
  message: string;
}

export type RegistrationInitiationResponse = ApiResponse<RegistrationInitiationResult>;
export type VerifyRegistrationResponse = ApiResponse<AuthVerificationResult>;
export type ForgotPasswordResponse = ApiResponse<RegistrationInitiationResult>;
export type ResetPasswordResponse = ApiResponse<GenericMessageResult>;
export type VerifyOtpResponse = ApiResponse<GenericMessageResult>;
export type ResendOtpResponse = ApiResponse<RegistrationInitiationResult>;
