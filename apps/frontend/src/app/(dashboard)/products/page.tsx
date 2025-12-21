"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { BulkActions } from "./bulk-actions";
import { useProducts, useDebounce } from "@/hooks";
import {
    PaginationState,
    SortingState,
    ColumnFiltersState,
    OnChangeFn,
    RowSelectionState,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";

function ProductsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Parse URL params (Source of Truth for generic table state)
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder =
        (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const isAvailableParam = searchParams.get("isAvailable");
    const isAvailable =
        isAvailableParam === "true"
            ? true
            : isAvailableParam === "false"
              ? false
              : undefined;
    const searchParam = searchParams.get("search") || "";

    // 2. Local State for Text Search (to allow typing/debouncing)
    // We initialize it from URL, but then it diverges until debounced push.
    const [searchQuery, setSearchQuery] = useState(searchParam);
    const debouncedSearch = useDebounce(searchQuery, 500);

    // 3. Row Selection State
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // 4. Effect: Push Search to URL (Debounced)
    useEffect(() => {
        // Only push if the debounced value differs from what's in the URL
        if (debouncedSearch !== searchParam) {
            const params = new URLSearchParams(searchParams.toString());
            if (debouncedSearch) {
                params.set("search", debouncedSearch);
            } else {
                params.delete("search");
            }
            // Reset page to 1 on search change
            params.set("page", "1");
            router.push(`${pathname}?${params.toString()}`);
        }
    }, [debouncedSearch, searchParam, pathname, router, searchParams]);

    // 5. Data Fetching
    const { data, isLoading } = useProducts({
        page,
        limit,
        sortBy,
        sortOrder,
        search: debouncedSearch, // Use debounced value so table updates after delay
        isAvailable,
    });

    const products = data?.data || [];
    const pageCount = data?.pagination?.pages || 0;

    // 6. Construct Table State
    // Pagination & Sorting come directly from URL
    const pagination: PaginationState = {
        pageIndex: page - 1,
        pageSize: limit,
    };
    const sorting: SortingState = [{ id: sortBy, desc: sortOrder === "desc" }];
    // Column Filters: Merge URL filters + Local Search state
    const columnFilters: ColumnFiltersState = [];
    if (searchQuery) columnFilters.push({ id: "name", value: searchQuery });
    if (isAvailable !== undefined)
        columnFilters.push({
            id: "isAvailable",
            value: [isAvailable.toString()],
        });

    // 7. Handlers
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
        const nameFilter = newFilters.find((f) => f.id === "name");
        const newSearchValue = (nameFilter?.value as string) || "";
        setSearchQuery(newSearchValue);

        // Handle Status (isAvailable) - Update URL Immediately (no debounce needed for faceted)
        const statusFilter = newFilters.find((f) => f.id === "isAvailable");
        const newStatusValue = (statusFilter?.value as string[])?.[0]; // take first

        // Only push if status CHANGED.
        // We need to check against 'isAvailable' (URL state).
        // Since setColumnFilters calls this with *all* filters, we must inspect `isAvailable`.
        const currentStatusStr =
            isAvailable === undefined ? undefined : isAvailable.toString();

        if (newStatusValue !== currentStatusStr) {
            const params = new URLSearchParams(searchParams.toString());
            if (newStatusValue) {
                params.set("isAvailable", newStatusValue);
            } else {
                params.delete("isAvailable");
            }
            params.set("page", "1");
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    // 8. Get selected products for bulk actions
    const selectedProducts = products.filter(
        (_, index) => rowSelection[index.toString()]
    );
    const selectedIds = selectedProducts.map((p) => p.id);

    const clearSelection = () => setRowSelection({});

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
                title="Products"
                description="Manage your product inventory."
            >
                <Button onClick={() => router.push("/products/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </PageHeader>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <BulkActions
                    selectedIds={selectedIds}
                    selectedProducts={selectedProducts}
                    onClearSelection={clearSelection}
                />
            )}

            <Card className="p-6">
                <DataTable
                    data={products}
                    columns={columns}
                    pageCount={pageCount}
                    searchKey="name"
                    filters={[
                        {
                            columnId: "isAvailable",
                            title: "Status",
                            options: [
                                { label: "Available", value: "true" },
                                { label: "Unavailable", value: "false" },
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
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
