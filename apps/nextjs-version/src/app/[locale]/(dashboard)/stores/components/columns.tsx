"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Store } from "@/types/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { DataTableRowActions } from "./data-table-row-actions";
import { getStatusColor } from "@/lib/badge-styles";

export const columns: ColumnDef<Store>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const store = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-md">
            <AvatarImage src={store.imageUrl} alt={store.name} />
            <AvatarFallback>
              {store.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{store.name}</span>
            <span className="text-xs text-muted-foreground">{store.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const store = row.original;
      return (
        <div className="flex flex-col">
          <span className="truncate max-w-[200px]">{store.address}</span>
          <span className="text-xs text-muted-foreground">
            {store.city}, {store.country}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <StarIcon className="h-3 w-3 fill-primary text-primary" />
          <span>{row.getValue("rating")}</span>
          <span className="text-xs text-muted-foreground">
            ({row.original.totalReviews})
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "city",
    header: "City",
    enableHiding: false,
    cell: ({ row }) => row.original.city,
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      const status = isActive ? "Active" : "Inactive";
      return (
        <Badge
          className={cn("capitalize", getStatusColor(status))}
          variant="outline"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isOpen",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Open Now" />
    ),
    cell: ({ row }) => {
      const isOpen = row.getValue("isOpen");
      const statusLabel = isOpen ? "Open" : "Closed";
      const statusColor = isOpen ? "active" : "suspended";

      return (
        <Badge className={cn(getStatusColor(statusColor))} variant="outline">
          {statusLabel}
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
        <span className="text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
