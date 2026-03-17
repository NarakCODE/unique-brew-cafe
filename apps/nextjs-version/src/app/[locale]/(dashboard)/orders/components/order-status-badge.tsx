"use client";

import { Order, ORDER_STATUS_LABELS, OrderStatus } from "@/types/order";
import { cn } from "@/lib/utils";

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending_payment:
    "text-amber-700 bg-amber-50 ring-amber-600/20 dark:text-amber-400 dark:bg-amber-400/10 dark:ring-amber-400/20",
  confirmed:
    "text-blue-700 bg-blue-50 ring-blue-600/20 dark:text-blue-400 dark:bg-blue-400/10 dark:ring-blue-400/20",
  preparing:
    "text-violet-700 bg-violet-50 ring-violet-600/20 dark:text-violet-400 dark:bg-violet-400/10 dark:ring-violet-400/20",
  ready:
    "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-400/10 dark:ring-green-400/20",
  picked_up:
    "text-teal-700 bg-teal-50 ring-teal-600/20 dark:text-teal-400 dark:bg-teal-400/10 dark:ring-teal-400/20",
  completed:
    "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-400/10 dark:ring-green-400/20",
  cancelled:
    "text-red-700 bg-red-50 ring-red-600/20 dark:text-red-400 dark:bg-red-400/10 dark:ring-red-400/20",
};

interface OrderStatusBadgeProps {
  status: Order["status"];
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        ORDER_STATUS_STYLES[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
