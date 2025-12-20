"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";

import { format } from "date-fns";
import { DataTableRowActions } from "./data-table-row-actions";
import { AvatarImageHandler } from "@/components/shared/avatar-image-handler";

export const columns: ColumnDef<Category>[] = [
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
            <DataTableColumnHeader column={column} title="Image" />
        ),
        cell: ({ row }) => {
            const imageUrl = row.getValue("imageUrl") as string;
            const name = row.getValue("name") as string;

            return (
                <AvatarImageHandler
                    src={imageUrl}
                    alt={name}
                    fallback={name.charAt(0).toUpperCase()}
                    className={
                        "relative h-10 w-10 overflow-hidden rounded-full"
                    }
                />
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
        accessorKey: "slug",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Slug" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex w-[100px] items-center">
                    <span>{row.getValue("slug")}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "displayOrder",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Order" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex items-center">
                    <span>{row.getValue("displayOrder")}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "isActive",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const isActive = row.getValue("isActive");

            if (isActive) {
                return (
                    <Badge className="gap-1.5 border-none bg-green-600/10 text-green-600 shadow-none hover:bg-green-600/20 focus-visible:outline-none focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20 dark:focus-visible:ring-green-400/40">
                        <span
                            className="size-1.5 rounded-full bg-green-600 dark:bg-green-400"
                            aria-hidden="true"
                        />
                        Active
                    </Badge>
                );
            }

            return (
                <Badge className="gap-1.5 border-none bg-destructive/10 text-destructive shadow-none hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40">
                    <span
                        className="size-1.5 rounded-full bg-destructive"
                        aria-hidden="true"
                    />
                    Inactive
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)));
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
