import { User } from "./user";

// Auth Types
export type UserRole = "user" | "admin" | "moderator";

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthState {
    user: import("./user").User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface InitiateRegistrationInput {
    email: string;
    password: string;
    fullName: string;
}

export interface VerifyRegistrationInput {
    email: string;
    password: string;
    fullName: string;
    otpCode: string;
}
