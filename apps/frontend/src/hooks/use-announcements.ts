// /**
//  * Announcement Hooks - Server State Management
//  * Uses TanStack Query for announcement management (admin)
//  */

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "@/lib/api";
// import type {
//     Announcement,
//     CreateAnnouncementData,
//     UpdateAnnouncementData,
// } from "@/types";

// // ============================================================================
// // QUERY KEYS
// // ============================================================================

// export const announcementKeys = {
//     all: ["announcements"] as const,
//     lists: () => [...announcementKeys.all, "list"] as const,
//     list: (filters: AnnouncementFilters) =>
//         [...announcementKeys.lists(), filters] as const,
//     details: () => [...announcementKeys.all, "detail"] as const,
//     detail: (id: string) => [...announcementKeys.details(), id] as const,
// };

// // ============================================================================
// // TYPES
// // ============================================================================

// export interface AnnouncementFilters {
//     page?: number;
//     limit?: number;
//     search?: string;
// }

// // ============================================================================
// // QUERIES
// // ============================================================================

// /**
//  * Get paginated list of announcements (Admin only)
//  */
// export function useAnnouncements(filters: AnnouncementFilters = {}) {
//     return useQuery({
//         queryKey: announcementKeys.list(filters),
//         queryFn: () => api.announcements.adminList(filters),
//         staleTime: 60 * 1000, // 1 minute
//         placeholderData: (previousData) => previousData,
//     });
// }

// /**
//  * Get single announcement by ID
//  */
// export function useAnnouncement(id: string | null) {
//     return useQuery({
//         queryKey: announcementKeys.detail(id!),
//         queryFn: () => api.announcements.get(id!),
//         enabled: !!id,
//         staleTime: 60 * 1000,
//     });
// }

// // ============================================================================
// // MUTATIONS
// // ============================================================================

// /**
//  * Create announcement (Admin only)
//  */
// export function useCreateAnnouncement() {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: (data: CreateAnnouncementData) =>
//             api.announcements.create(data),
//         onSuccess: () => {
//             // Invalidate all announcement lists
//             queryClient.invalidateQueries({
//                 queryKey: announcementKeys.lists(),
//             });
//         },
//     });
// }

// /**
//  * Update announcement (Admin only)
//  */
// export function useUpdateAnnouncement() {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: ({
//             id,
//             data,
//         }: {
//             id: string;
//             data: UpdateAnnouncementData;
//         }) => api.announcements.update(id, data),
//         onSuccess: (_, { id }) => {
//             // Invalidate announcement detail
//             queryClient.invalidateQueries({
//                 queryKey: announcementKeys.detail(id),
//             });
//             // Invalidate all announcement lists
//             queryClient.invalidateQueries({
//                 queryKey: announcementKeys.lists(),
//             });
//         },
//     });
// }

// /**
//  * Delete announcement (Admin only)
//  */
// export function useDeleteAnnouncement() {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: (id: string) => api.announcements.delete(id),
//         onSuccess: () => {
//             // Invalidate all announcement lists
//             queryClient.invalidateQueries({
//                 queryKey: announcementKeys.lists(),
//             });
//         },
//     });
// }

// /**
//  * Toggle publish status (Admin only)
//  */
// export function useTogglePublishAnnouncement() {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: (id: string) => api.announcements.togglePublish(id),
//         onSuccess: (_, id) => {
//             // Invalidate announcement detail
//             queryClient.invalidateQueries({
//                 queryKey: announcementKeys.detail(id),
//             });
//             // Invalidate all announcement lists
//             queryClient.invalidateQueries({
//                 queryKey: announcementKeys.lists(),
//             });
//         },
//     });
// }
