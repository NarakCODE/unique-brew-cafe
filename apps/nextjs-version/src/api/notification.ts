import { apiClient } from "@/lib/api-client";
import {
  NotificationResponse,
  NotificationCountResponse,
  NotificationStatsResponse,
} from "@/types/notification";

export const getNotifications = async (): Promise<NotificationResponse> => {
  return apiClient.get("/notifications/history");
};

export const getUnreadNotificationCount =
  async (): Promise<NotificationCountResponse> => {
    return apiClient.get("/notifications/unread-count");
  };

export const getNotificationStats =
  async (): Promise<NotificationStatsResponse> => {
    return apiClient.get("/notifications/stats");
  };
