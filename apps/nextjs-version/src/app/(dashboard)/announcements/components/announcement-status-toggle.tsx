"use client";

import { Switch } from "@/components/ui/switch";
import { useTogglePublishAnnouncement } from "@/hooks/use-announcement";
import { Announcement } from "@/types/announcement";

interface AnnouncementStatusToggleProps {
  announcement: Announcement;
}

export function AnnouncementStatusToggle({
  announcement,
}: AnnouncementStatusToggleProps) {
  const { mutate: togglePublish, isPending } = useTogglePublishAnnouncement();

  const handleToggle = (checked: boolean) => {
    togglePublish(announcement.id);
  };

  return (
    <Switch
      checked={announcement.isActive}
      onCheckedChange={handleToggle}
      disabled={isPending}
      aria-label="Toggle active status"
    />
  );
}
