import type { ApiResponse, Pagination } from "../../../packages/api/src";
import { buildQueryString, withQuery } from "../../../packages/api/src";

import { mobileApiClient } from "@/lib/mobile-api-client";
import {
  normalizeProductListResponse,
  type ProductListData,
} from "@/services/product.service";

type RawCategory = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  parentId?: string | null;
  storeId: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CategoryListApiResponse = ApiResponse<RawCategory[]>;
type CategoryApiResponse = ApiResponse<RawCategory>;

type CategoryProductsApiResponse = ApiResponse<{
  data: Array<{
    _id?: string;
    id?: string;
    name: string;
    slug: string;
    description: string;
    categoryId: RawCategory | string | null;
    category?: RawCategory | string | null;
    images?: unknown[];
    basePrice: number;
    currency: "USD" | "KHR";
    preparationTime: number;
    calories?: number;
    rating?: number;
    totalReviews: number;
    isAvailable: boolean;
    isFeatured: boolean;
    isBestSelling: boolean;
    allergens?: string[];
    tags?: string[];
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: Pagination;
}>;

export type MobileCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  parentId?: string | null;
  storeId: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CategoryProductQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function getCategories() {
  const response = await mobileApiClient.get<CategoryListApiResponse>(
    "/categories",
  );

  return response.data.map(normalizeCategory);
}

export async function getCategoryById(categoryId: string) {
  const response = await mobileApiClient.get<CategoryApiResponse>(
    `/categories/${categoryId}`,
  );

  return normalizeCategory(response.data);
}

export async function getCategoryBySlug(slug: string) {
  const response = await mobileApiClient.get<CategoryApiResponse>(
    `/categories/slug/${slug}`,
  );

  return normalizeCategory(response.data);
}

export async function getSubcategories(categoryId: string) {
  const response = await mobileApiClient.get<CategoryListApiResponse>(
    `/categories/${categoryId}/subcategories`,
  );

  return response.data.map(normalizeCategory);
}

export async function getCategoryProducts(
  categoryId: string,
  query: CategoryProductQuery = {},
): Promise<ProductListData> {
  const response = await mobileApiClient.get<CategoryProductsApiResponse>(
    withQuery(
      `/categories/${categoryId}/products`,
      buildQueryString({
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      }),
    ),
  );

  return normalizeProductListResponse(response);
}

function normalizeCategory(category: RawCategory): MobileCategory {
  return {
    id: category.id ?? category._id ?? "",
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    icon: category.icon,
    parentId: category.parentId ?? null,
    storeId: category.storeId,
    displayOrder: category.displayOrder,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
