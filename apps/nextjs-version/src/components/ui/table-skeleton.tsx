import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ColumnConfig {
  /** Width of the skeleton (e.g., "100px", "50%", "w-24") */
  width?: string;
  /** Whether this column should be hidden on mobile */
  hiddenOnMobile?: boolean;
  /** Custom class for the skeleton */
  className?: string;
  /** Alignment of the skeleton content */
  align?: "left" | "center" | "right";
}

interface TableSkeletonProps {
  /** Number of rows to display */
  rows?: number;
  /** Column configuration - can be a number or array of column configs */
  columns?: number | ColumnConfig[];
  /** Whether to show the table header skeleton */
  showHeader?: boolean;
  /** Whether to show a checkbox column */
  showCheckbox?: boolean;
  /** Whether to show an actions column */
  showActions?: boolean;
  /** Custom class for the table container */
  className?: string;
  /** Custom class for each row */
  rowClassName?: string;
  /** Custom class for each cell */
  cellClassName?: string;
}

/**
 * A reusable table skeleton component that displays a loading placeholder
 * matching the structure of data tables.
 *
 * @example Basic usage
 * ```tsx
 * <TableSkeleton rows={5} columns={4} />
 * ```
 *
 * @example With column configuration
 * ```tsx
 * <TableSkeleton
 *   rows={10}
 *   columns={[
 *     { width: "w-32" },
 *     { width: "w-48" },
 *     { width: "w-24", hiddenOnMobile: true },
 *     { width: "w-20", align: "right" },
 *   ]}
 *   showCheckbox
 *   showActions
 * />
 * ```
 */
function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  showCheckbox = false,
  showActions = false,
  className,
  rowClassName,
  cellClassName,
}: TableSkeletonProps) {
  // Normalize columns to array format
  const columnConfigs: ColumnConfig[] = React.useMemo(() => {
    if (typeof columns === "number") {
      return Array.from({ length: columns }, () => ({}));
    }
    return columns;
  }, [columns]);

  // Generate alignment class
  const getAlignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "mx-auto";
      case "right":
        return "ml-auto";
      default:
        return "";
    }
  };

  return (
    <Table className={className}>
      {showHeader && (
        <TableHeader>
          <TableRow className={rowClassName}>
            {showCheckbox && (
              <TableHead className="w-10">
                <Skeleton className="h-4 w-4 rounded" />
              </TableHead>
            )}
            {columnConfigs.map((col, index) => (
              <TableHead
                key={`header-${index}`}
                className={cn(
                  col.hiddenOnMobile && "hidden md:table-cell",
                  cellClassName,
                )}
              >
                <Skeleton
                  className={cn(
                    "h-4",
                    col.width ?? "w-24",
                    getAlignClass(col.align),
                    col.className,
                  )}
                />
              </TableHead>
            ))}
            {showActions && (
              <TableHead className="w-20">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={`row-${rowIndex}`} className={rowClassName}>
            {showCheckbox && (
              <TableCell className="w-10">
                <Skeleton className="h-4 w-4 rounded" />
              </TableCell>
            )}
            {columnConfigs.map((col, colIndex) => (
              <TableCell
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  col.hiddenOnMobile && "hidden md:table-cell",
                  cellClassName,
                )}
              >
                <Skeleton
                  className={cn(
                    "h-4",
                    col.width ?? "w-full max-w-52",
                    getAlignClass(col.align),
                    col.className,
                  )}
                />
              </TableCell>
            ))}
            {showActions && (
              <TableCell className="w-20">
                <div className="flex items-center justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface TableSkeletonCardProps {
  /** Number of rows to display */
  rows?: number;
  /** Number of columns to display */
  columns?: number;
  /** Custom class for the container */
  className?: string;
}

/**
 * A card-wrapped table skeleton with search bar and pagination placeholders.
 * Useful for full page loading states.
 *
 * @example
 * ```tsx
 * <TableSkeletonCard rows={10} columns={5} />
 * ```
 */
function TableSkeletonCard({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonCardProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and filter bar skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <TableSkeleton rows={rows} columns={columns} showCheckbox showActions />
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export { TableSkeleton, TableSkeletonCard };
export type { ColumnConfig, TableSkeletonProps, TableSkeletonCardProps };
