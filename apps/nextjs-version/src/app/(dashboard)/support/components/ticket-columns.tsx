"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Ticket } from "@/types/support";
import { DataTableColumnHeader } from "@/app/(dashboard)/products/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

function TicketActions({ ticket }: { ticket: Ticket }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(ticket._id)}
        >
          Copy ticket ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push(`/support/tickets/${ticket._id}`)}
        >
          View details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "ticketNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ticket #" />
    ),
    cell: ({ row }) => (
      <div className="w-20 font-medium">#{row.getValue("ticketNumber")}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "userId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original.userId;
      if (typeof user === "object" && user !== null && "fullName" in user) {
        // @ts-ignore - TS might complain if type is not fully inferred as populated
        return (
          <div className="font-medium whitespace-nowrap">
            {user.fullName || user.email}
          </div>
        );
      }
      return (
        <div
          className="text-muted-foreground truncate max-w-25 text-xs"
          title={String(user)}
        >
          {String(user)}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subject" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col space-y-1">
          <span className="max-w-125 truncate font-medium">
            {row.getValue("subject")}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-125">
            {row.original.message}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="capitalize">
          {row.getValue("category")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "open"
              ? "default"
              : status === "in_progress"
                ? "secondary"
                : status === "resolved"
                  ? "outline" // Green-ish usually, but outline is fine for now
                  : "destructive" // Closed
          }
          className="capitalize"
        >
          {status.replace("_", " ")}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      return (
        <Badge
          variant={
            priority === "high"
              ? "destructive"
              : priority === "medium"
                ? "default" // or secondary
                : "outline"
          }
          className="capitalize"
        >
          {priority}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground text-sm">
          {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <TicketActions ticket={row.original} />,
  },
];
