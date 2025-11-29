/**
 * Authentication Hooks - Server State Management
 * Uses TanStack Query for API calls and Zustand for token storage
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import type { LoginCredentials, AuthResponse } from "@/types/auth";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const authKeys = {
    all: ["auth"] as const,
    me: () => [...authKeys.all, "me"] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get current authenticated user
 */
export function useMe() {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: authKeys.me(),
        queryFn: () => api.auth.me(),
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Login mutation
 */
export function useLogin() {
    const queryClient = useQueryClient();
    const { setAuth } = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: (credentials: LoginCredentials) =>
            api.auth.login(credentials),
        onSuccess: (data: AuthResponse) => {
            // Store tokens in Zustand
            setAuth(data);

            // Set user data in cache
            queryClient.setQueryData(authKeys.me(), data.user);

            // Invalidate user-specific queries
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });

            // Redirect to dashboard
            router.push("/dashboard");
        },
    });
}

/**
 * Register mutation
 */
export function useRegister() {
    const queryClient = useQueryClient();
    const { setAuth } = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: {
            email: string;
            password: string;
            name: string;
            phone?: string;
        }) => api.auth.register(data),
        onSuccess: (data: AuthResponse) => {
            // Store tokens in Zustand
            setAuth(data);

            // Set user data in cache
            queryClient.setQueryData(authKeys.me(), data.user);

            // Redirect to verification page or dashboard
            router.push("/verify-email");
        },
    });
}

/**
 * Logout mutation
 */
export function useLogout() {
    const queryClient = useQueryClient();
    const { logout } = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: () => api.auth.logout(),
        onSettled: () => {
            // Clear auth state
            logout();

            // Clear all queries
            queryClient.clear();

            // Redirect to login
            router.push("/login");
        },
    });
}

/**
 * Verify email mutation
 */
export function useVerifyEmail() {
    return useMutation({
        mutationFn: (data: { email: string; otp: string }) =>
            api.auth.verifyEmail(data),
    });
}

/**
 * Resend verification email mutation
 */
export function useResendVerification() {
    return useMutation({
        mutationFn: (email: string) => api.auth.resendVerification(email),
    });
}

/**
 * Forgot password mutation
 */
export function useForgotPassword() {
    return useMutation({
        mutationFn: (email: string) => api.auth.forgotPassword(email),
    });
}

/**
 * Reset password mutation
 */
export function useResetPassword() {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: { token: string; password: string }) =>
            api.auth.resetPassword(data),
        onSuccess: () => {
            router.push("/login");
        },
    });
}

/**
 * Refresh token mutation (usually handled automatically by the API client)
 */
export function useRefreshToken() {
    const { updateAccessToken } = useAuthStore();

    return useMutation({
        mutationFn: (refreshToken: string) => api.auth.refresh(refreshToken),
        onSuccess: (data) => {
            updateAccessToken(data.accessToken);
        },
    });
}
