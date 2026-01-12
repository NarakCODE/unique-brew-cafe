"use client";

import { useAnnouncements } from "@/hooks/use-announcement";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { MegaphoneIcon } from "lucide-react";

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
        description="View and manage your active announcements."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Announcements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[30%]">Description</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No announcements found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    announcements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell className="font-medium">
                          {announcement.title}
                        </TableCell>
                        <TableCell
                          className="max-w-xs"
                          title={announcement.description}
                        >
                          <span className="line-clamp-2">
                            {announcement.description}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(
                            new Date(announcement.startDate),
                            "MMM d, yyyy"
                          )}
                          <span className="mx-1">-</span>
                          {format(
                            new Date(announcement.endDate),
                            "MMM d, yyyy"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {announcement.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {announcement.targetAudience}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              announcement.isActive ? "default" : "secondary"
                            }
                          >
                            {announcement.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
