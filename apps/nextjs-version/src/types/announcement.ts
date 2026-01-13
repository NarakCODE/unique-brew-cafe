export interface Announcement {
  id: string;
  title: string;
  description: string;
  actionType: "none" | "link" | "route";
  priority: number;
  targetAudience: string;
  userTierFilter: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetAnnouncementsResponse {
  statusCode: number;
  data: Announcement[];
  message: string;
  success: boolean;
}

export interface GetAnnouncementResponse {
  statusCode: number;
  data: Announcement;
  message: string;
  success: boolean;
}
