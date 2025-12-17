"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Store } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

import { format } from "date-fns";
import Image from "next/image";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Store>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-0.5"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-0.5"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "imageUrl",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Logo" />
        ),
        cell: ({ row }) => {
            const imageUrl = row.getValue("imageUrl") as string;
            const name = row.getValue("name") as string;

            if (!imageUrl) {
                return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <span className="text-xs text-muted-foreground">
                            No Item
                        </span>
                    </div>
                );
            }

            return (
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                        src={imageUrl}
                        alt={name || "Store logo"}
                        fill
                        className="object-cover"
                    />
                </div>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
            <div className="flex space-x-2">
                <span className="max-w-[500px] truncate font-medium">
                    {row.getValue("name")}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "city",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="City" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex w-[100px] items-center">
                    <span>{row.getValue("city")}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "isActive",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const isActive = row.getValue("isActive");
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)));
        },
    },
    {
        accessorKey: "isOpen",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Open" />
        ),
        cell: ({ row }) => {
            const isOpen = row.getValue("isOpen");
            return (
                <Badge variant={isOpen ? "outline" : "destructive"}>
                    {isOpen ? "Open" : "Closed"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created At" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex w-[100px] items-center">
                    <span>
                        {format(new Date(row.getValue("createdAt")), "PPP")}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
];
