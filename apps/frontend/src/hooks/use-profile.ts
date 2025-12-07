/**
 * Profile Hooks - Server State Management
 * Uses TanStack Query for user profile CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
    UserProfile,
    UpdateProfileData,
    UpdateSettingsData,
    UpdatePasswordData,
    ReferralStats,
    DeleteAccountData,
} from "@/types/profile";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const profileKeys = {
    all: ["profile"] as const,
    detail: () => [...profileKeys.all, "detail"] as const,
    referral: () => [...profileKeys.all, "referral"] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get current user's profile
 */
export function useProfile() {
    return useQuery({
        queryKey: profileKeys.detail(),
        queryFn: () => api.profile.get(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Get referral statistics
 */
export function useReferralStats() {
    return useQuery({
        queryKey: profileKeys.referral(),
        queryFn: () => api.profile.getReferralStats(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update profile information
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfileData) => api.profile.update(data),
        onSuccess: (updatedProfile) => {
            // Update the cache with the new profile data
            queryClient.setQueryData(profileKeys.detail(), updatedProfile);
        },
    });
}

/**
 * Upload profile image
 */
export function useUploadProfileImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (imageUrl: string) => api.profile.uploadImage(imageUrl),
        onSuccess: () => {
            // Invalidate profile to refetch with new image
            queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
        },
    });
}

/**
 * Update password
 */
export function useUpdatePassword() {
    return useMutation({
        mutationFn: (data: UpdatePasswordData) =>
            api.profile.updatePassword(data),
    });
}

/**
 * Update settings/preferences
 */
export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateSettingsData) =>
            api.profile.updateSettings(data),
        onSuccess: (updatedProfile) => {
            // Update the cache with the new profile data
            queryClient.setQueryData(profileKeys.detail(), updatedProfile);
        },
    });
}

/**
 * Delete account
 */
export function useDeleteAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DeleteAccountData) =>
            api.profile.deleteAccount(data),
        onSuccess: () => {
            // Clear all cached data
            queryClient.clear();
        },
    });
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
    UserProfile,
    UpdateProfileData,
    UpdateSettingsData,
    ReferralStats,
};
