export interface Category {
  _id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  categoryId: Category;
  images: string[];
  basePrice: number;
  currency: string;
  preparationTime: number;
  totalReviews: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSelling: boolean;
  allergens: string[];
  tags: string[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  id: string;
  category: Category;
  calories?: number;
  rating?: number;
  customizations?: unknown[];
  addOns?: unknown[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetProductsResponse {
  statusCode: number;
  data: {
    data: Product[];
    pagination: Pagination;
  };
  message: string;
  success: boolean;
}

export interface GetProductResponse {
  statusCode: number;
  data: Product;
  message: string;
  success: boolean;
}
