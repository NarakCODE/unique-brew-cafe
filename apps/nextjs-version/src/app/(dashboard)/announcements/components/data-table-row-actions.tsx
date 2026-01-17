"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Announcement } from "@/types/announcement";
import { AnnouncementDetailsDialog } from "./announcement-details-dialog";
import { UpdateAnnouncementDialog } from "./update-announcement-dialog";
import { DeleteAnnouncementDialog } from "./delete-announcement-dialog";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions({
  row,
}: DataTableRowActionsProps<Announcement>) {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const announcement = row.original;

  return (
    <>
      <AnnouncementDetailsDialog
        id={announcement.id}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
      <UpdateAnnouncementDialog
        id={announcement.id}
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
      />
      <DeleteAnnouncementDialog
        id={announcement.id}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setShowDetailsDialog(true)}>
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowUpdateDialog(true)}>
            Edit details
          </DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
            Delete
            <span className="ml-auto text-xs tracking-widest opacity-60">
              ⌘⌫
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
