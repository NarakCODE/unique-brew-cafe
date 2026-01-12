import { apiClient } from "@/lib/api-client";
import { Announcement, GetAnnouncementsResponse } from "@/types/announcement";

export const getAnnouncements = async (): Promise<GetAnnouncementsResponse> => {
  return apiClient.get("/announcements?isPublished=true");
};
