import { useQuery } from "@tanstack/react-query";

import { getAnnouncementById } from "@/services/announcement.service";

export function useAnnouncement(id?: string) {
  return useQuery({
    queryKey: ["announcement", id],
    queryFn: () => getAnnouncementById(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}
