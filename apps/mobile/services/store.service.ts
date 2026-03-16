import type { StoreResponse, StoresResponse } from "../../../packages/api/src";

import { mobileApiClient } from "@/lib/mobile-api-client";

type GetStoresParams = {
  search?: string;
  page?: number;
  limit?: number;
};

type StoresApiResponse = {
  statusCode: number;
  data: {
    data: Array<{
      _id: string;
      id?: string;
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
      images?: string[];
      openingHours: {
        monday?: { open: string; close: string };
        tuesday?: { open: string; close: string };
        wednesday?: { open: string; close: string };
        thursday?: { open: string; close: string };
        friday?: { open: string; close: string };
        saturday?: { open: string; close: string };
        sunday?: { open: string; close: string };
      };
      specialHours?: Array<{
        date: string;
        open: string;
        close: string;
        reason?: string;
      }>;
      isOpen: boolean;
      isActive: boolean;
      isOpenNow: boolean;
      averagePrepTime: number;
      rating?: number;
      totalReviews: number;
      features: {
        parking: boolean;
        wifi: boolean;
        outdoorSeating: boolean;
        driveThrough: boolean;
      };
      distance?: number;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
  success: boolean;
};

export async function getStores({
  search,
  page = 1,
  limit = 20,
}: GetStoresParams = {}) {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (search?.trim()) {
    searchParams.set("search", search.trim());
  }

  const response = await mobileApiClient.get<StoresApiResponse>(
    `/stores?${searchParams.toString()}`,
  );

  const normalized: StoresResponse = {
    ...response,
    data: {
      items: response.data.data.map((store) => ({
        id: store.id ?? store._id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        address: store.address,
        city: store.city,
        state: store.state,
        postalCode: store.postalCode,
        country: store.country,
        phone: store.phone,
        email: store.email,
        latitude: store.latitude,
        longitude: store.longitude,
        imageUrl: store.imageUrl,
        images: store.images ?? [],
        openingHours: store.openingHours,
        specialHours: store.specialHours ?? [],
        isOpen: store.isOpen,
        isActive: store.isActive,
        isOpenNow: store.isOpenNow,
        averagePrepTime: store.averagePrepTime,
        rating: store.rating,
        totalReviews: store.totalReviews,
        features: store.features,
        distance: store.distance,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      })),
      pagination: response.data.pagination,
    },
  };

  return normalized.data;
}

type StoreApiItem = StoresApiResponse["data"]["data"][number];

export async function getStoreById(id: string) {
  const response = await mobileApiClient.get<{
    statusCode: number;
    data: StoreApiItem;
    message: string;
    success: boolean;
  }>(`/stores/${id}`);

  const normalized: StoreResponse = {
    ...response,
    data: {
      id: response.data.id ?? response.data._id,
      name: response.data.name,
      slug: response.data.slug,
      description: response.data.description,
      address: response.data.address,
      city: response.data.city,
      state: response.data.state,
      postalCode: response.data.postalCode,
      country: response.data.country,
      phone: response.data.phone,
      email: response.data.email,
      latitude: response.data.latitude,
      longitude: response.data.longitude,
      imageUrl: response.data.imageUrl,
      images: response.data.images ?? [],
      openingHours: response.data.openingHours,
      specialHours: response.data.specialHours ?? [],
      isOpen: response.data.isOpen,
      isActive: response.data.isActive,
      isOpenNow: response.data.isOpenNow,
      averagePrepTime: response.data.averagePrepTime,
      rating: response.data.rating,
      totalReviews: response.data.totalReviews,
      features: response.data.features,
      distance: response.data.distance,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
    },
  };

  return normalized.data;
}
