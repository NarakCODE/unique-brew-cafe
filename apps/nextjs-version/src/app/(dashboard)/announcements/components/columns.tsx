"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

import { DataTableColumnHeader } from "./data-table-column-header";
import { Announcement } from "@/types/announcement";
import { DataTableRowActions } from "./data-table-row-actions";
import { AnnouncementStatusToggle } from "./announcement-status-toggle";

export const columns: ColumnDef<Announcement>[] = [
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
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-125 truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-75 truncate text-muted-foreground">
            {row.getValue("description")}
          </span>
        </div>
      );
    },
  },
  {
    id: "status",
    accessorFn: (row) => (row.isActive ? "active" : "inactive"),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return <AnnouncementStatusToggle announcement={row.original} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "targetAudience",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Audience" />
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("targetAudience")}</div>
    ),
  },
  {
    id: "dates",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dates" />
    ),
    cell: ({ row }) => {
      const start = new Date(row.original.startDate);
      const end = new Date(row.original.endDate);
      return (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {format(start, "MMM d, yyyy")} - {format(end, "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
