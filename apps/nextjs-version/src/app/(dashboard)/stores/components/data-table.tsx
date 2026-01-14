"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Store } from "lucide-react";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  page?: number;
  limit?: number;
  rowCount?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount = -1,
  page = 1,
  limit = 20,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create query string helper
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Initialize filters from URL
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    () => {
      const filters: ColumnFiltersState = [];
      const search = searchParams.get("search");
      if (search) {
        filters.push({ id: "name", value: search });
      }
      const city = searchParams.get("city");
      if (city) {
        filters.push({ id: "city", value: city });
      }
      const isActive = searchParams.get("isActive");
      if (isActive) {
        filters.push({ id: "isActive", value: [isActive] });
      }
      return filters;
    }
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Sync filters to URL
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      let hasChanged = false;

      // Handle 'name' -> 'search'
      const nameFilter = columnFilters.find((f) => f.id === "name");
      const currentSearch = params.get("search");
      if (nameFilter?.value && String(nameFilter.value) !== currentSearch) {
        params.set("search", String(nameFilter.value));
        hasChanged = true;
      } else if (!nameFilter?.value && currentSearch) {
        params.delete("search");
        hasChanged = true;
      }

      // Handle 'city'
      const cityFilter = columnFilters.find((f) => f.id === "city");
      const currentCity = params.get("city");
      if (cityFilter?.value && String(cityFilter.value) !== currentCity) {
        params.set("city", String(cityFilter.value));
        hasChanged = true;
      } else if (!cityFilter?.value && currentCity) {
        params.delete("city");
        hasChanged = true;
      }

      // Handle 'isActive'
      const isActiveFilter = columnFilters.find((f) => f.id === "isActive");
      const currentIsActive = params.get("isActive");
      const newIsActive =
        isActiveFilter?.value &&
        Array.isArray(isActiveFilter.value) &&
        isActiveFilter.value.length === 1
          ? String(isActiveFilter.value[0])
          : null;

      if (newIsActive !== currentIsActive) {
        if (newIsActive) {
          params.set("isActive", newIsActive);
        } else {
          params.delete("isActive");
        }
        hasChanged = true;
      }

      if (hasChanged) {
        params.set("page", "1"); // Reset page when filters change
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [columnFilters, pathname, router, searchParams]);

  // Handle pagination change
  const onPaginationChange = (updaterOrValue: any) => {
    const newPagination =
      typeof updaterOrValue === "function"
        ? updaterOrValue({
            pageIndex: page - 1,
            pageSize: limit,
          })
        : updaterOrValue;

    router.push(
      `${pathname}?${createQueryString({
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize,
      })}`
    );
  };

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Empty className="py-14 border-0">
                    <EmptyMedia>
                      <Store className="text-muted-foreground size-10" />
                    </EmptyMedia>
                    <EmptyContent>
                      <EmptyHeader>
                        <EmptyTitle>No stores found</EmptyTitle>
                        <EmptyDescription>
                          Try adjusting your search or filters to find what
                          you&apos;re looking for.
                        </EmptyDescription>
                      </EmptyHeader>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
