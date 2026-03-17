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
  storeId?: string;
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isBestSelling?: boolean;
  tags?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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

export interface ProductSize {
  name: string;
  price: number;
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  images: string[];
  basePrice: number;
  sizes: ProductSize[];
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface CreateProductResponse {
  statusCode: number;
  data: Product;
  message: string;
  success: boolean;
}
