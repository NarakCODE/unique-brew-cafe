import { API_BASE_URL } from "@/lib/mobile-api-client";

export function formatAnnouncementDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function resolveAnnouncementImageUrl(imageUrl?: string) {
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
