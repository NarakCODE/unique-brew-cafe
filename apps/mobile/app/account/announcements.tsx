import { AccountActionHeader } from "@/components/account/account-action-header";
import { AnnouncementList } from "@/components/announcement/AnnouncementList";

export default function AnnouncementsScreen() {
  return (
    <AnnouncementList
      headerComponent={<AccountActionHeader title="Announcements" />}
    />
  );
}
