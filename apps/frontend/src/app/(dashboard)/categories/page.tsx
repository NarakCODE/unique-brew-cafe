"use client";

import { PageHeader } from "@/components/layout/page-header";
import { columns } from "./columns";
// import { CreateCategoryDialog } from "./create-category-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { useCategories } from "@/hooks/use-categories";
import { Loader2 } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
    PaginationState,
    SortingState,
    ColumnFiltersState,
    OnChangeFn,
} from "@tanstack/react-table";

import { Suspense } from "react";

function CategoriesContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Parse query params
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const isActiveParam = searchParams.get("isActive");
    const isActive =
        isActiveParam === "true"
            ? true
            : isActiveParam === "false"
              ? false
              : undefined;
    const sortBy = searchParams.get("sortBy") || "displayOrder"; // Default sort by displayOrder
    const sortOrder =
        (searchParams.get("sortOrder") as "asc" | "desc") || "asc"; // Default asc

    // Data fetching
    const { data: response, isLoading } = useCategories({
        page,
        limit,
        isActive,
        sortBy,
        sortOrder,
    });

    const categories = response?.items || [];
    const meta = response?.pagination;
    const pageCount = meta?.pages || 0;

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

    // Filters
    const columnFilters: ColumnFiltersState = [];
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
            <PageHeader
                title="Categories"
                description="Manage your product categories here."
            >
                {/* <CreateCategoryDialog /> */}
            </PageHeader>
            <DataTable
                data={categories}
                columns={columns}
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

export default function CategoriesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CategoriesContent />
        </Suspense>
    );
}
