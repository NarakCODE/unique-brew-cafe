import { ApiResponse } from "./api";

export interface Announcement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  actionType: "promo_code" | "deep_link" | "external_url" | "none";
  actionValue?: string;
  priority: number;
  targetAudience: "all" | "new_users" | "loyal_users" | "specific_tier";
  userTierFilter: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AnnouncementListData {
  items: Announcement[];
  pagination: PaginationMeta;
}

export type AnnouncementListResponse = ApiResponse<AnnouncementListData>;
export type AnnouncementResponse = ApiResponse<Announcement>;
