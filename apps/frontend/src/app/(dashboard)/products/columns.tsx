"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";

export const columns: ColumnDef<Product>[] = [
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
        header: "Image",
        cell: ({ row }) => {
            const images = row.original.images || [];
            const imageUrl = images.length > 0 ? images[0] : "";
            const name = row.getValue("name") as string;
            return (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={imageUrl} alt={name} />
                    <AvatarFallback>
                        {name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="max-w-[200px] truncate font-medium">
                        {row.getValue("name")}
                    </span>
                    <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {row.original.category?.name || "Uncategorized"}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "slug",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Slug" />
        ),
        cell: ({ row }) => (
            <div className="w-[100px] truncate">{row.getValue("slug")}</div>
        ),
        enableSorting: false,
        enableHiding: true,
    },
    {
        accessorKey: "basePrice",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("basePrice"));
            const currency = row.original.currency;
            return (
                <div className="font-medium">
                    {formatCurrency(price, currency)}
                </div>
            );
        },
    },
    {
        accessorKey: "displayOrder",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Order" />
        ),
        cell: ({ row }) => (
            <div className="w-20 text-center">
                {row.getValue("displayOrder")}
            </div>
        ),
    },
    {
        accessorKey: "isAvailable",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const isAvailable = row.getValue("isAvailable");
            return isAvailable ? (
                <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 bg-green-50"
                >
                    Available
                </Badge>
            ) : (
                <Badge variant="outline" className="text-muted-foreground">
                    Unavailable
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)));
        },
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
            const tags: string[] = row.getValue("tags") || [];
            return (
                <div className="flex max-w-[150px] flex-wrap gap-1">
                    {tags.slice(0, 2).map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="px-1 py-0 text-[10px]"
                        >
                            {tag}
                        </Badge>
                    ))}
                    {tags.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                            +{tags.length - 2}
                        </span>
                    )}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
            return (
                <div className="w-[100px] text-xs text-muted-foreground">
                    {new Date(row.getValue("createdAt")).toLocaleDateString()}
                </div>
            );
        },
        enableHiding: true,
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
];
