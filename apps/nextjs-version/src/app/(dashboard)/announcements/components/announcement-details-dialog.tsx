"use client";

import { useAnnouncement } from "@/hooks/use-announcement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

interface AnnouncementDetailsDialogProps {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnnouncementDetailsDialog({
  id,
  open,
  onOpenChange,
}: AnnouncementDetailsDialogProps) {
  const { announcement, isLoading } = useAnnouncement(open ? id : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Announcement Details</DialogTitle>
          <DialogDescription>
            View detailed information about the announcement.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          </div>
        ) : announcement ? (
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label className="text-muted-foreground">Title</Label>
              <div className="font-semibold text-lg">{announcement.title}</div>
            </div>

            <div className="grid gap-2">
              <Label className="text-muted-foreground">Description</Label>
              <div className="text-sm rounded-md bg-muted p-3">
                {announcement.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Status</Label>
                <div>
                  <Badge
                    variant={announcement.isActive ? "default" : "secondary"}
                  >
                    {announcement.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Priority</Label>
                <div>
                  <Badge variant="outline">{announcement.priority}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Start Date</Label>
                <div className="text-sm font-medium">
                  {format(new Date(announcement.startDate), "PPP p")}
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-muted-foreground">End Date</Label>
                <div className="text-sm font-medium">
                  {format(new Date(announcement.endDate), "PPP p")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Target Audience</Label>
                <div className="capitalize font-medium">
                  {announcement.targetAudience.replace("_", " ")}
                </div>
              </div>
              {/* Conditional fields if we had them or action type */}
              <div className="grid gap-2">
                <Label className="text-muted-foreground">Action Type</Label>
                <div className="capitalize font-medium">
                  {announcement.actionType}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Views:{" "}
                <span className="font-medium text-foreground">
                  {announcement.viewCount}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Clicks:{" "}
                <span className="font-medium text-foreground">
                  {announcement.clickCount}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Announcement not found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
