// Store Types
export interface OpeningHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface StoreFeatures {
  parking?: boolean;
  wifi?: boolean;
  outdoorSeating?: boolean;
  driveThrough?: boolean;
}

export interface Store {
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
  images: string[];
  openingHours: Record<string, OpeningHours>;
  isOpen: boolean;
  isActive: boolean;
  rating?: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}
