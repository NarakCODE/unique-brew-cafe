import type { FavoriteItem } from "../../../../packages/api/src";

export function getFavoriteImageUri(images?: FavoriteItem["images"]) {
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

export function formatFavoriteCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatFavoriteSavedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatFavoriteLatestDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
