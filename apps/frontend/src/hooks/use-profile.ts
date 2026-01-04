"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// 1. Import the consolidated types we created
// 1. Import the consolidated types we created
import type {
    User,
    UserPreferences,
    UpdatePasswordData,
    DeleteAccountData,
    ReferralStats,
} from "@/types/user";
import type { UpdateProfileSchemaType } from "@/schemas/profile-schema";

// 2. Define types strictly for API interactions (DTOs)
// These specific request bodies weren't in the previous file, so we define them here
// or import them if you move them to your types file.

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
 * Returns the full User object including preferences
 */
export function useProfile() {
    return useQuery<User>({
        queryKey: profileKeys.detail(),
        queryFn: () => api.profile.get(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Get referral statistics
 */
export function useReferralStats() {
    return useQuery<ReferralStats>({
        queryKey: profileKeys.referral(),
        queryFn: () => api.profile.getReferralStats(),
        staleTime: 10 * 60 * 1000,
    });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update profile information (Name, Phone, etc.)
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        // Uses the Partial<User> type we defined earlier
        mutationFn: (data: UpdateProfileSchemaType) => api.profile.update(data),
        onSuccess: (updatedProfile: User) => {
            // Update the cache immediately
            queryClient.setQueryData(profileKeys.detail(), updatedProfile);
        },
    });
}

/**
 * Update settings/preferences specificially
 * Uses Partial<UserPreferences> to allow updating just one setting
 */
export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<UserPreferences>) =>
            api.profile.updateSettings(data),

        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(profileKeys.detail(), updatedProfile);
        },
    });
}

/**
 * Upload profile image
 * Assumes the API returns the full updated User object
 */
export function useUploadProfileImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (imageUrl: string) => api.profile.uploadImage(imageUrl),
        onSuccess: (data: { profileImage: string }) => {
            queryClient.setQueryData<User>(profileKeys.detail(), (oldUser) => {
                if (!oldUser) return undefined;
                return { ...oldUser, profileImage: data.profileImage };
            });
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
 * Delete account
 */
export function useDeleteAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DeleteAccountData) =>
            api.profile.deleteAccount(data),
        onSuccess: () => {
            // Clear all data immediately upon deletion
            queryClient.clear();
            // Optional: Redirect to login or home page here
        },
    });
}
