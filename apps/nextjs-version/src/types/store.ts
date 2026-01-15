export interface OpeningHoursDay {
  open: string;
  close: string;
}

export interface OpeningHours {
  _id: string;
  monday: OpeningHoursDay;
  tuesday: OpeningHoursDay;
  wednesday: OpeningHoursDay;
  thursday: OpeningHoursDay;
  friday: OpeningHoursDay;
  saturday: OpeningHoursDay;
  sunday: OpeningHoursDay;
}

export interface SpecialHour {
  _id: string;
  date: string;
  open: string;
  close: string;
  reason: string;
}

export interface StoreFeatures {
  _id: string;
  parking: boolean;
  wifi: boolean;
  outdoorSeating: boolean;
  driveThrough: boolean;
}

export interface Store {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  images: string[];
  openingHours: OpeningHours;
  specialHours: SpecialHour[];
  isOpen: boolean;
  isOpenNow: boolean;
  isActive: boolean;
  averagePrepTime: number;
  rating: number;
  totalReviews: number;
  features: StoreFeatures;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreOpeningHours {
  monday: OpeningHoursDay;
  tuesday: OpeningHoursDay;
  wednesday: OpeningHoursDay;
  thursday: OpeningHoursDay;
  friday: OpeningHoursDay;
  saturday: OpeningHoursDay;
  sunday: OpeningHoursDay;
}

export interface CreateStoreFeatures {
  parking: boolean;
  wifi: boolean;
  outdoorSeating: boolean;
  driveThrough: boolean;
}

export interface CreateStorePayload {
  name: string;
  slug?: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  images?: string[];
  openingHours: CreateStoreOpeningHours;
  specialHours?: Omit<SpecialHour, "_id">[];
  isOpen?: boolean;
  isActive?: boolean;
  averagePrepTime?: number;
  features?: CreateStoreFeatures;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetStoresResponse {
  statusCode: number;
  data: {
    data: Store[];
    pagination: Pagination;
  };
  message: string;
  success: boolean;
}

export interface StoreFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
  city?: string;
}

export interface PickupTimesData {
  storeId: string;
  storeName: string;
  date: string;
  pickupTimes: string[];
}

export interface GetPickupTimesResponse {
  statusCode: number;
  data: PickupTimesData;
  message: string;
  success: boolean;
}

export interface StoreHoursData {
  storeId: string;
  storeName: string;
  openingHours: OpeningHours;
  specialHours: SpecialHour[];
  isOpenNow: boolean;
}

export interface GetStoreHoursResponse {
  statusCode: number;
  data: StoreHoursData;
  message: string;
  success: boolean;
}
