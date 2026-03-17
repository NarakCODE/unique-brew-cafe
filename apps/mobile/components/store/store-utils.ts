import type { StoreItem } from "../../../../packages/api/src";

import { API_BASE_URL } from "@/lib/mobile-api-client";

export function getStoreImageUri(store: Pick<StoreItem, "imageUrl" | "images">) {
  const primary = resolveStoreImageUrl(store.imageUrl);

  if (primary) {
    return primary;
  }

  const firstImage = resolveStoreImageUrl(extractFirstImage(store.images));

  if (!firstImage) {
    return null;
  }

  return firstImage;
}

export function getStoreGalleryUris(
  store: Pick<StoreItem, "imageUrl" | "images">,
) {
  const primaryImage = getStoreImageUri(store);
  const normalizedImages = (store.images ?? [])
    .map((image) => resolveStoreImageUrl(image))
    .filter((image): image is string => Boolean(image));

  return normalizedImages.filter((image, index, images) => {
    if (image === primaryImage) {
      return false;
    }

    return images.indexOf(image) === index;
  });
}

export function resolveStoreImageUrl(imageUrl?: string | null) {
  const value = imageUrl?.trim();

  if (!value) {
    return null;
  }

  if (/^(https?:|data:|file:)/i.test(value)) {
    return value;
  }

  const apiOrigin = new URL(API_BASE_URL).origin;

  if (value.startsWith("/")) {
    return `${apiOrigin}${value}`;
  }

  return `${apiOrigin}/${value}`;
}

export function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export function formatStoreAddress(store: Pick<StoreItem, "address" | "city">) {
  return [store.address, store.city].filter(Boolean).join(", ");
}

export function normalizeStoreText(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstImage(images?: string[]) {
  const firstImage = images?.[0]?.trim();

  if (!firstImage) {
    return null;
  }

  if (firstImage.startsWith("[")) {
    try {
      const parsed = JSON.parse(firstImage) as unknown;

      if (Array.isArray(parsed) && typeof parsed[0] === "string") {
        return parsed[0];
      }
    } catch {
      return firstImage;
    }
  }

  return firstImage;
}
