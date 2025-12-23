"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { CreateUserDialog } from "./create-user-dialog";
import { useUsers, useDebounce } from "@/hooks";
import {
    PaginationState,
    SortingState,
    ColumnFiltersState,
    OnChangeFn,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";

function UsersContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Parse URL params (Source of Truth)
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder =
        (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const roleParam = searchParams.get("role");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search") || "";

    // 2. Local State for Text Search (debouncing)
    const [searchQuery, setSearchQuery] = useState(searchParam);
    const debouncedSearch = useDebounce(searchQuery, 500);

    //  3. Create User Dialog State
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // 5. Effect: Push Search to URL (Debounced)
    useEffect(() => {
        if (debouncedSearch !== searchParam) {
            const params = new URLSearchParams(searchParams.toString());
            if (debouncedSearch) {
                params.set("search", debouncedSearch);
            } else {
                params.delete("search");
            }
            params.set("page", "1");
            router.push(`${pathname}?${params.toString()}`);
        }
    }, [debouncedSearch, searchParam, pathname, router, searchParams]);

    // 6. Data Fetching
    const { data, isLoading } = useUsers({
        page,
        limit,
        role: roleParam || undefined,
        search: debouncedSearch,
    });

    const users = data?.data || [];
    const pageCount = data?.pagination?.pages || 0;

    // 7. Construct Table State
    const pagination: PaginationState = {
        pageIndex: page - 1,
        pageSize: limit,
    };
    const sorting: SortingState = [{ id: sortBy, desc: sortOrder === "desc" }];

    // Column Filters: Merge URL filters + Local Search state
    const columnFilters: ColumnFiltersState = [];
    if (searchQuery) columnFilters.push({ id: "fullName", value: searchQuery });
    if (roleParam) columnFilters.push({ id: "role", value: [roleParam] });
    if (statusParam) columnFilters.push({ id: "status", value: [statusParam] });

    // 8. Handlers
    const handlePaginationChange: OnChangeFn<PaginationState> = (
        updaterOrValue
    ) => {
        const newPagination =
            typeof updaterOrValue === "function"
                ? updaterOrValue(pagination)
                : updaterOrValue;
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", (newPagination.pageIndex + 1).toString());
        params.set("limit", newPagination.pageSize.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
        const newSorting =
            typeof updaterOrValue === "function"
                ? updaterOrValue(sorting)
                : updaterOrValue;
        const params = new URLSearchParams(searchParams.toString());
        const primarySort = newSorting[0];
        if (primarySort) {
            params.set("sortBy", primarySort.id);
            params.set("sortOrder", primarySort.desc ? "desc" : "asc");
        } else {
            params.delete("sortBy");
            params.delete("sortOrder");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
        updaterOrValue
    ) => {
        const newFilters =
            typeof updaterOrValue === "function"
                ? updaterOrValue(columnFilters)
                : updaterOrValue;

        // Handle Search (Name) - Update Local State
        const nameFilter = newFilters.find((f) => f.id === "fullName");
        const newSearchValue = (nameFilter?.value as string) || "";
        setSearchQuery(newSearchValue);

        // Handle Role Filter - Update URL Immediately
        const roleFilter = newFilters.find((f) => f.id === "role");
        const newRoleValue = (roleFilter?.value as string[])?.[0];

        const currentRoleStr = roleParam || undefined;

        if (newRoleValue !== currentRoleStr) {
            const params = new URLSearchParams(searchParams.toString());
            if (newRoleValue) {
                params.set("role", newRoleValue);
            } else {
                params.delete("role");
            }
            params.set("page", "1");
            router.push(`${pathname}?${params.toString()}`);
        }

        // Handle Status Filter - Update URL Immediately
        const statusFilter = newFilters.find((f) => f.id === "status");
        const newStatusValue = (statusFilter?.value as string[])?.[0];

        const currentStatusStr = statusParam || undefined;

        if (newStatusValue !== currentStatusStr) {
            const params = new URLSearchParams(searchParams.toString());
            if (newStatusValue) {
                params.set("status", newStatusValue);
            } else {
                params.delete("status");
            }
            params.set("page", "1");
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Users"
                description="Manage user accounts and permissions."
            >
                <Button onClick={() => setShowCreateDialog(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create User
                </Button>
            </PageHeader>

            <Card className="p-6">
                <DataTable
                    data={users}
                    columns={columns}
                    pageCount={pageCount}
                    searchKey="fullName"
                    filters={[
                        {
                            columnId: "role",
                            title: "Role",
                            options: [
                                { label: "User", value: "user" },
                                { label: "Admin", value: "admin" },
                                { label: "Moderator", value: "moderator" },
                            ],
                        },
                        {
                            columnId: "status",
                            title: "Status",
                            options: [
                                { label: "Active", value: "active" },
                                { label: "Suspended", value: "suspended" },
                            ],
                        },
                    ]}
                    pagination={pagination}
                    sorting={sorting}
                    columnFilters={columnFilters}
                    onPaginationChange={handlePaginationChange}
                    onSortingChange={handleSortingChange}
                    onColumnFiltersChange={handleColumnFiltersChange}
                    manualPagination
                    manualSorting
                    manualFiltering
                />
            </Card>

            <CreateUserDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />
        </div>
    );
}

export default function UsersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UsersContent />
        </Suspense>
    );
}
