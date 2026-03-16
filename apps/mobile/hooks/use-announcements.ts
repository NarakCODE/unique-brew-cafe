import { useQuery } from "@tanstack/react-query";

import { getAnnouncements } from "@/services/announcement.service";

export function useAnnouncements(limit?: number) {
  return useQuery({
    queryKey: ["announcements", { limit: limit ?? null }],
    queryFn: () => getAnnouncements(limit),
    staleTime: 1000 * 60 * 5,
  });
}
