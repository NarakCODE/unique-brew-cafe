"use client";

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

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const store = row.original as Store;
    const deleteMutation = useDeleteStore();
    const toggleStatusMutation = useToggleStoreStatus();

    return (
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
                    {store.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => deleteMutation.mutate(store.id)}
                    disabled={deleteMutation.isPending}
                >
                    <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Delete
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
