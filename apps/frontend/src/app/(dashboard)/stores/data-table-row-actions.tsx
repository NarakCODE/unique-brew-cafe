"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Pen, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Store } from "@/types";
import { useDeleteStore, useToggleStoreStatus } from "@/hooks/use-stores";
import { HugeiconsIcon } from "@hugeicons/react";
import { StatusIcon } from "@hugeicons/core-free-icons";

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

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const store = row.original as Store;
    const deleteMutation = useDeleteStore();
    const toggleStatusMutation = useToggleStoreStatus();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <>
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the store <strong>{store.name}</strong> and
                            remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                deleteMutation.mutate(store.id);
                                setShowDeleteDialog(false);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(store.id)}
                    >
                        <Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => toggleStatusMutation.mutate(store.id)}
                    >
                        <HugeiconsIcon icon={StatusIcon} />{" "}
                        {store.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={() => setShowDeleteDialog(true)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                        <Trash className="mr-2 h-3.5 w-3.5" />
                        Delete
                        <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
