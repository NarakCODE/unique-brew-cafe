"use client";

import { useAnnouncements } from "@/hooks/use-announcement";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MegaphoneIcon } from "lucide-react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default function AnnouncementsPage() {
  const { announcements, isLoading, isError } = useAnnouncements();

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
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Announcements"
        description="View and manage your announcements."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Announcements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-37.5 lg:w-62.5" />
                <Skeleton className="h-8 w-17.5" />
              </div>
              <div className="rounded-md border p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : (
            <DataTable columns={columns} data={announcements} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
