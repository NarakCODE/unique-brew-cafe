"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { useAdminStores } from "@/hooks/use-stores";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    PaginationState,
    SortingState,
    ColumnFiltersState,
    OnChangeFn,
} from "@tanstack/react-table";

import { Suspense } from "react";

function StoresContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Parse query params
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const city = searchParams.get("city") || undefined;
    const isActiveParam = searchParams.get("isActive");
    const isActive =
        isActiveParam === "true"
            ? true
            : isActiveParam === "false"
              ? false
              : undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder =
        (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    // Data fetching
    const { data: response, isLoading } = useAdminStores({
        page,
        limit,
        city,
        isActive,
        sortBy,
        sortOrder,
    });

    const stores = response?.data || [];
    const meta = response?.pagination;
    const pageCount = meta?.totalPages || 0;

    // We can fetch all available distinct cities for the filter from a separate endpoint or meta if available.
    // However, if we only have the current page's data, the filter list might be incomplete.
    // For now, let's assume we can get unique cities from the *current* data, or better yet,
    // if the goal is just distinct cities from the DB, we might need a separate query.
    // Using current page data for filter options is a common simplified approach.
    const uniqueCities = Array.from(new Set(stores.map((s) => s.city))).filter(
        Boolean
    );

    // -- State Mappers --

    // Pagination
    const pagination: PaginationState = {
        pageIndex: page - 1,
        pageSize: limit,
    };

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

    // Sorting
    const sorting: SortingState = [
        {
            id: sortBy,
            desc: sortOrder === "desc",
        },
    ];

    const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
        const newSorting =
            typeof updaterOrValue === "function"
                ? updaterOrValue(sorting)
                : updaterOrValue;

        const params = new URLSearchParams(searchParams.toString());
        const primarySort = newSorting[0]; // Only single column sort supported by API for now

        if (primarySort) {
            params.set("sortBy", primarySort.id);
            params.set("sortOrder", primarySort.desc ? "desc" : "asc");
        } else {
            params.delete("sortBy");
            params.delete("sortOrder");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    // Filters
    const columnFilters: ColumnFiltersState = [];
    if (city) columnFilters.push({ id: "city", value: [city] }); // Faceted expects array usually
    if (isActive !== undefined)
        columnFilters.push({ id: "isActive", value: [isActive.toString()] });

    const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
        updaterOrValue
    ) => {
        const newFilters =
            typeof updaterOrValue === "function"
                ? updaterOrValue(columnFilters)
                : updaterOrValue;

        const params = new URLSearchParams(searchParams.toString());

        // Handle 'city'
        const cityFilter = newFilters.find((f) => f.id === "city");
        if (cityFilter && (cityFilter.value as string[])?.length > 0) {
            // Assuming single selection for now as per API, but taking first
            const val = (cityFilter.value as string[])[0];
            params.set("city", val);
        } else {
            params.delete("city");
        }

        // Handle 'isActive'
        const statusFilter = newFilters.find((f) => f.id === "isActive");
        if (statusFilter && (statusFilter.value as string[])?.length > 0) {
            const val = (statusFilter.value as string[])[0];
            params.set("isActive", val);
        } else {
            params.delete("isActive");
        }

        // Reset page to 1 on filter change
        params.set("page", "1");

        router.push(`${pathname}?${params.toString()}`);
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="Stores" description="Manage your stores here.">
                <Button asChild>
                    <Link href="/stores/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Store
                    </Link>
                </Button>
            </PageHeader>
            <DataTable
                data={stores}
                columns={columns}
                // Manual Control Props
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={handlePaginationChange}
                sorting={sorting}
                onSortingChange={handleSortingChange}
                columnFilters={columnFilters}
                onColumnFiltersChange={handleColumnFiltersChange}
                manualPagination={true}
                manualSorting={true}
                manualFiltering={true}
                filters={[
                    {
                        columnId: "city",
                        title: "City",
                        options: uniqueCities.map((city) => ({
                            label: city,
                            value: city,
                        })),
                    },
                    {
                        columnId: "isActive",
                        title: "Status",
                        options: [
                            { label: "Active", value: "true" },
                            { label: "Inactive", value: "false" },
                        ],
                    },
                ]}
            />
        </div>
    );
}

export default function StoresPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StoresContent />
        </Suspense>
    );
}
