"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";

export const columns: ColumnDef<User>[] = [
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
        accessorKey: "profileImage",
        header: "Avatar",
        cell: ({ row }) => {
            const user = row.original;
            const initials = user.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
            return (
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profileImage} alt={user.fullName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "fullName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex flex-col">
                    <span className="max-w-[200px] truncate font-medium">
                        {user.fullName}
                    </span>
                    <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "role",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            const roleColors = {
                admin: "text-red-600 border-red-200 bg-red-50",
                moderator: "text-blue-600 border-blue-200 bg-blue-50",
                user: "text-gray-600 border-gray-200 bg-gray-50",
            };
            return (
                <Badge
                    variant="outline"
                    className={roleColors[role as keyof typeof roleColors]}
                >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)));
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const statusColors = {
                active: "text-green-600 border-green-200 bg-green-50",
                suspended: "text-orange-600 border-orange-200 bg-orange-50",
                deleted: "text-red-600 border-red-200 bg-red-50",
            };
            return (
                <Badge
                    variant="outline"
                    className={
                        statusColors[status as keyof typeof statusColors]
                    }
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(String(row.getValue(id)));
        },
    },
    {
        accessorKey: "loyaltyTier",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tier" />
        ),
        cell: ({ row }) => {
            const tier = row.getValue("loyaltyTier") as string;
            const tierColors = {
                platinum: "text-purple-600 border-purple-200 bg-purple-50",
                gold: "text-yellow-600 border-yellow-200 bg-yellow-50",
                silver: "text-gray-600 border-gray-200 bg-gray-50",
                bronze: "text-amber-600 border-amber-200 bg-amber-50",
            };
            return (
                <Badge
                    variant="outline"
                    className={tierColors[tier as keyof typeof tierColors]}
                >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </Badge>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "totalOrders",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Orders" />
        ),
        cell: ({ row }) => {
            return (
                <div className="text-center font-medium">
                    {row.getValue("totalOrders")}
                </div>
            );
        },
    },
    {
        accessorKey: "totalSpent",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Total Spent" />
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalSpent"));
            return (
                <div className="font-medium">
                    {formatCurrency(amount, "USD")}
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Joined" />
        ),
        cell: ({ row }) => {
            return (
                <div className="text-xs text-muted-foreground">
                    {new Date(row.getValue("createdAt")).toLocaleDateString()}
                </div>
            );
        },
    },
    {
        accessorKey: "lastLoginAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Last Login" />
        ),
        cell: ({ row }) => {
            const lastLogin = row.getValue("lastLoginAt") as string | undefined;
            return (
                <div className="text-xs text-muted-foreground">
                    {lastLogin
                        ? new Date(lastLogin).toLocaleDateString()
                        : "Never"}
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
