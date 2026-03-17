"use client";

import { useOrders } from "@/hooks/use-orders";
import { Order, OrderFilters, OrderStatus } from "@/types/order";
import { useState } from "react";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderStatusActions } from "./order-status-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const STATUS_FILTER_OPTIONS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All Orders", value: "all" },
  { label: "Order Received", value: "pending_payment" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready for Pickup", value: "ready" },
  { label: "Picked Up", value: "picked_up" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export function OrdersList() {
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 15,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { orders, pagination, isLoading, refetch } = useOrders(filters);

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as OrderStatus),
      page: 1,
    }));
  };

  const handlePage = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Select defaultValue="all" onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-16 text-center text-muted-foreground"
                >
                  No orders found for the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order, index) => (
                <TableRow
                  key={
                    (order as Order & { _id?: string })._id ||
                    order.id ||
                    order.orderNumber ||
                    index
                  }
                >
                  <TableCell className="font-mono text-sm font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {typeof order.userId === "string"
                      ? order.userId.slice(-6)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, h:mm a")}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    ${order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <OrderStatusActions order={order} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {pagination.total} orders · Page {pagination.page} of{" "}
            {pagination.pages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => handlePage((filters.page ?? 1) - 1)}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => handlePage((filters.page ?? 1) + 1)}
              className="cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
