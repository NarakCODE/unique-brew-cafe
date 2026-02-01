"use client";

import { useState } from "react";

import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Eye, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useUpdateStoreStatus } from "@/hooks/use-update-store-status";
import { useDeleteStore } from "@/hooks/use-delete-store";
import { Store } from "@/types/store";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const store = row.original as Store;
  const router = useRouter();
  const { mutate: deleteStore, isPending: isDeleting } = useDeleteStore();
  const { mutate: updateStatus } = useUpdateStoreStatus();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
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

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() => router.push(`/stores/${store._id || store.id}/edit`)}
            disabled={!store.isActive}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(`/stores/${store._id || store.id}`)}
            disabled={!store.isActive}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              updateStatus({
                id: store._id || store.id,
                isActive: !store.isActive,
              })
            }
            className="flex items-center gap-2"
          >
            <Power className="h-4 w-4" />
            {store.isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              store &quot;{store.name}&quot; and remove its data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteStore(store._id || store.id, {
                  onSuccess: () => setShowDeleteDialog(false),
                });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
