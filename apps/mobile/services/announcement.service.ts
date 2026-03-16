import type {
  AnnouncementListResponse,
  AnnouncementResponse,
} from "../../../packages/api/src";

import { mobileApiClient } from "@/lib/mobile-api-client";

export async function getAnnouncements(limit?: number) {
  const searchParams = new URLSearchParams();

  if (typeof limit === "number") {
    searchParams.set("limit", String(limit));
  }

  searchParams.set("sortBy", "priority");
  searchParams.set("sortOrder", "desc");

  const queryString = searchParams.toString();
  const path = queryString ? `/announcements?${queryString}` : "/announcements";

  const response = await mobileApiClient.get<AnnouncementListResponse>(path);

  return response.data;
}

export async function getAnnouncementById(id: string) {
  const response = await mobileApiClient.get<AnnouncementResponse>(
    `/announcements/${id}`,
  );

  return response.data;
}
