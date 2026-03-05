export interface Announcement {
  id: string;
  title: string;
  description: string;
  actionType: "none" | "promo_code" | "deep_link" | "external_url";
  actionValue?: string;
  priority: number;
  targetAudience: string;
  userTierFilter: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementDTO {
  title: string;
  description: string;
  endDate: string; // ISO Date string
}

export type UpdateAnnouncementDTO = Partial<CreateAnnouncementDTO>;

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

export interface CreateAnnouncementResponse {
  statusCode: number;
  data: Announcement;
  message: string;
  success: boolean;
}

export interface UpdateAnnouncementResponse {
  statusCode: number;
  data: Announcement;
  message: string;
  success: boolean;
}

export interface DeleteAnnouncementResponse {
  statusCode: number;
  data: null;
  message: string;
  success: boolean;
}

export interface TogglePublishAnnouncementResponse {
  statusCode: number;
  data: Announcement;
  message: string;
  success: boolean;
}
