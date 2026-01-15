"use client";

import { useAnnouncements } from "@/hooks/use-announcement";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { MegaphoneIcon, Loader2, Plus } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useState } from "react";
import { CreateAnnouncementDialog } from "./components/create-announcement-dialog";

export default function AnnouncementsPage() {
  const { announcements, isLoading, isError } = useAnnouncements();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (isError) {
    return (
      <div className="flex h-full min-h-[50vh] flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
          <MegaphoneIcon className="h-6 w-6" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">
          Failed to load announcements
        </h3>
        <p>
          Please try again later or contact support if the problem persists.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-1 flex-col space-y-8 md:flex">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Announcements"
            description="View and manage your announcements."
          />

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus />
            Add New
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : announcements?.length === 0 ? (
          <Empty className="min-h-[50vh]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MegaphoneIcon className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No announcements found</EmptyTitle>
              <EmptyDescription>
                It looks like there are no announcements content using the
                current filters.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>Create Announcement</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <DataTable columns={columns} data={announcements} />
        )}
      </div>
      <CreateAnnouncementDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
