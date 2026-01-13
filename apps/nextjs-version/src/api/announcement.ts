import { apiClient } from "@/lib/api-client";
import {
  GetAnnouncementsResponse,
  GetAnnouncementResponse,
} from "@/types/announcement";

export const getAnnouncements = async (): Promise<GetAnnouncementsResponse> => {
  return apiClient.get("/announcements/all?isPublished=true");
};

export const getAnnouncement = async (
  id: string
): Promise<GetAnnouncementResponse> => {
  return apiClient.get(`/announcements/${id}`);
};
