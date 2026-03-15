import { User } from './profile';

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

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

// Additional auth inputs can be added as needed based on the backend schema
