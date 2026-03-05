import { apiClient } from "@/lib/api-client";
import {
  GetAnnouncementsResponse,
  GetAnnouncementResponse,
  CreateAnnouncementDTO,
  CreateAnnouncementResponse,
  UpdateAnnouncementDTO,
  UpdateAnnouncementResponse,
  DeleteAnnouncementResponse,
  TogglePublishAnnouncementResponse,
} from "@/types/announcement";

export const getAnnouncements = async (): Promise<GetAnnouncementsResponse> => {
  return apiClient.get("/announcements/all?isPublished=true");
};

export const getPublicAnnouncements =
  async (): Promise<GetAnnouncementsResponse> => {
    return apiClient.get("/announcements");
  };

export const getAnnouncement = async (
  id: string
): Promise<GetAnnouncementResponse> => {
  return apiClient.get(`/announcements/${id}`);
};

export const createAnnouncement = async (
  data: CreateAnnouncementDTO
): Promise<CreateAnnouncementResponse> => {
  return apiClient.post("/announcements", data);
};

export const updateAnnouncement = async (
  id: string,
  data: UpdateAnnouncementDTO
): Promise<UpdateAnnouncementResponse> => {
  return apiClient.put(`/announcements/${id}`, data);
};

export const deleteAnnouncement = async (
  id: string
): Promise<DeleteAnnouncementResponse> => {
  return apiClient.delete(`/announcements/${id}`);
};

export const togglePublishAnnouncement = async (
  id: string
): Promise<TogglePublishAnnouncementResponse> => {
  return apiClient.patch(`/announcements/${id}/publish`);
};

export const trackAnnouncementView = async (id: string): Promise<void> => {
  await apiClient.post(`/announcements/${id}/view`);
};

export const trackAnnouncementClick = async (id: string): Promise<void> => {
  await apiClient.post(`/announcements/${id}/click`);
};
