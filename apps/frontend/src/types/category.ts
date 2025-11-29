// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  storeId: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}
