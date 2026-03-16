import { ApiResponse } from "./api";

export interface StoreFeatures {
  parking: boolean;
  wifi: boolean;
  outdoorSeating: boolean;
  driveThrough: boolean;
}

export interface StoreHoursRange {
  open: string;
  close: string;
}

export interface StoreOpeningHours {
  monday?: StoreHoursRange;
  tuesday?: StoreHoursRange;
  wednesday?: StoreHoursRange;
  thursday?: StoreHoursRange;
  friday?: StoreHoursRange;
  saturday?: StoreHoursRange;
  sunday?: StoreHoursRange;
}

export interface StoreSpecialHour {
  date: string;
  open: string;
  close: string;
  reason?: string;
}

export interface StoreItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  phone: string;
  email?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  images: string[];
  openingHours: StoreOpeningHours;
  specialHours: StoreSpecialHour[];
  isOpen: boolean;
  isActive: boolean;
  isOpenNow: boolean;
  averagePrepTime: number;
  rating?: number;
  totalReviews: number;
  features: StoreFeatures;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StorePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StoresData {
  items: StoreItem[];
  pagination: StorePagination;
}

export type StoresResponse = ApiResponse<StoresData>;
export type StoreResponse = ApiResponse<StoreItem>;
