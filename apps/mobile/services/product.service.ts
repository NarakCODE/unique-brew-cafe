import type { ApiResponse, Pagination, ProductFilters } from "../../../packages/api/src";
import { buildProductQuery, withQuery } from "../../../packages/api/src";

import { mobileApiClient } from "@/lib/mobile-api-client";

type RawProductCategory = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  imageUrl?: string;
  icon?: string;
} | string | null;

type RawNutritionalInfo = {
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  caffeine?: number;
} | null;

type RawProduct = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  categoryId: RawProductCategory;
  category?: RawProductCategory;
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
  nutritionalInfo?: RawNutritionalInfo;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ProductListApiResponse = ApiResponse<{
  data: RawProduct[];
  pagination: Pagination;
}>;

type ProductCustomizationOption = {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
};

export type ProductCustomization = {
  id: string;
  productId: string;
  customizationType: "size" | "sugar_level" | "ice_level" | "coffee_level";
  options: ProductCustomizationOption[];
  isRequired: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductAddOn = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: "syrup" | "topping" | "extra_shot" | "dessert";
  imageUrl?: string;
  isAvailable: boolean;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  icon?: string;
};

export type ProductNutritionalInfo = {
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  caffeine?: number;
};

export type MobileProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string | null;
  category: ProductCategory | null;
  images: string[];
  basePrice: number;
  currency: "USD" | "KHR";
  preparationTime: number;
  calories?: number;
  rating?: number;
  totalReviews: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSelling: boolean;
  allergens: string[];
  tags: string[];
  nutritionalInfo: ProductNutritionalInfo | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductDetail = MobileProduct & {
  customizations: ProductCustomization[];
  addOns: ProductAddOn[];
};

export type ProductListData = {
  items: MobileProduct[];
  pagination: Pagination;
};

type ProductDetailApiResponse = ApiResponse<
  RawProduct & {
    customizations?: ProductCustomization[];
    addOns?: ProductAddOn[];
  }
>;

type ProductCustomizationsResponse = ApiResponse<{
  productId: string;
  customizations: ProductCustomization[];
}>;

type ProductAddOnsResponse = ApiResponse<{
  productId: string;
  addOns: ProductAddOn[];
}>;

export function normalizeProductCategory(
  category?: RawProductCategory,
): ProductCategory | null {
  if (!category || typeof category === "string") {
    return null;
  }

  const id = category.id ?? category._id;

  if (!id) {
    return null;
  }

  return {
    id,
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl,
    icon: category.icon,
  };
}

export function normalizeProduct(product: RawProduct): MobileProduct {
  const normalizedCategory =
    normalizeProductCategory(product.category) ??
    normalizeProductCategory(product.categoryId);
  const rawCategoryId =
    typeof product.categoryId === "string"
      ? product.categoryId
      : typeof product.category === "string"
        ? product.category
        : null;

  return {
    id: product.id ?? product._id ?? "",
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: normalizedCategory?.id ?? rawCategoryId,
    category: normalizedCategory,
    images: cleanImageUrls(product.images),
    basePrice: product.basePrice,
    currency: product.currency,
    preparationTime: product.preparationTime,
    calories: product.calories,
    rating: product.rating,
    totalReviews: product.totalReviews,
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured,
    isBestSelling: product.isBestSelling,
    allergens: product.allergens ?? [],
    tags: product.tags ?? [],
    nutritionalInfo: normalizeNutritionalInfo(product.nutritionalInfo),
    displayOrder: product.displayOrder,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function normalizeProductListResponse(
  response: ProductListApiResponse,
): ProductListData {
  return {
    items: response.data.data.map(normalizeProduct),
    pagination: response.data.pagination,
  };
}

export async function getProducts(filters?: ProductFilters) {
  const response = await mobileApiClient.get<ProductListApiResponse>(
    withQuery("/products", buildProductQuery(filters)),
  );

  return normalizeProductListResponse(response);
}

export async function getStoreMenu(
  storeId: string,
  filters?: ProductFilters,
) {
  const response = await mobileApiClient.get<ProductListApiResponse>(
    withQuery(`/stores/${storeId}/menu`, buildProductQuery(filters)),
  );

  return normalizeProductListResponse(response);
}

export async function getProductById(productId: string) {
  const response = await mobileApiClient.get<ProductDetailApiResponse>(
    `/products/${productId}`,
  );

  return normalizeProductDetail(response.data);
}

export async function getProductBySlug(slug: string) {
  const response = await mobileApiClient.get<ProductDetailApiResponse>(
    `/products/slug/${slug}`,
  );

  return normalizeProductDetail(response.data);
}

export async function searchProducts(
  query: string,
  filters?: Omit<ProductFilters, "search" | "isAvailable">,
) {
  const searchParams = new URLSearchParams(
    buildProductQuery({
      ...filters,
      search: undefined,
    }),
  );
  searchParams.set("q", query);

  const response = await mobileApiClient.get<ProductListApiResponse>(
    withQuery(
      "/products/search",
      searchParams.toString(),
    ),
  );

  return normalizeProductListResponse(response);
}

export async function getProductCustomizations(productId: string) {
  const response = await mobileApiClient.get<ProductCustomizationsResponse>(
    `/products/${productId}/customizations`,
  );

  return response.data;
}

export async function getProductAddOns(productId: string) {
  const response = await mobileApiClient.get<ProductAddOnsResponse>(
    `/products/${productId}/addons`,
  );

  return response.data;
}

function normalizeProductDetail(
  product: ProductDetailApiResponse["data"],
): ProductDetail {
  return {
    ...normalizeProduct(product),
    customizations: product.customizations ?? [],
    addOns: product.addOns ?? [],
  };
}

function cleanImageUrls(images?: unknown[]) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.flatMap((image) => {
    if (typeof image !== "string") {
      return [];
    }

    const trimmed = image.trim();

    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("[") || trimmed.startsWith("\"")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;

        if (Array.isArray(parsed)) {
          return parsed.filter(
            (entry): entry is string =>
              typeof entry === "string" && entry.trim().length > 0,
          );
        }

        if (typeof parsed === "string" && parsed.trim().length > 0) {
          return [parsed];
        }
      } catch {
        return [trimmed];
      }
    }

    return [trimmed];
  });
}

function normalizeNutritionalInfo(
  nutritionalInfo?: RawNutritionalInfo,
): ProductNutritionalInfo | null {
  if (!nutritionalInfo) {
    return null;
  }

  return {
    protein: nutritionalInfo.protein,
    carbohydrates: nutritionalInfo.carbohydrates,
    fat: nutritionalInfo.fat,
    caffeine: nutritionalInfo.caffeine,
  };
}
