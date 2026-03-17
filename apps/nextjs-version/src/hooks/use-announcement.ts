/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePublishAnnouncement,
} from "@/api/announcement";
import { ApiErrorResponse } from "@/types/api";
import {
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
} from "@/types/announcement";
import { toast } from "sonner";

export function useAnnouncements() {
  const query = useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncements,
  });

  return {
    announcements: query.data?.data.items ?? [],
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
    isError: query.isError,
  };
}

export function useAnnouncement(id: string | null) {
  const query = useQuery({
    queryKey: ["announcement", id],
    queryFn: () => getAnnouncement(id!),
    enabled: !!id,
  });

  return {
    announcement: query.data?.data,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    isError: query.isError,
  };
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementDTO) => createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement created successfully");
    },
    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || "Failed to create announcement");
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementDTO }) =>
      updateAnnouncement(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate main list and specific item
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcement", id] });
      toast.success("Announcement updated successfully");
    },
    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || "Failed to update announcement");
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement deleted successfully");
    },
    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || "Failed to delete announcement");
    },
  });
}

export function useTogglePublishAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => togglePublishAnnouncement(id),
    onSuccess: (data: any, id: string) => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcement", id] });
      toast.success(
        data.message || "Announcement publish status toggled successfully"
      );
    },
    onError: (error: ApiErrorResponse) => {
      toast.error(
        error.message || "Failed to toggle announcement publish status"
      );
    },
  });
}
