"use client";

import {
  Order,
  OrderStatus,
  VALID_NEXT_STATUSES,
  ORDER_STATUS_LABELS,
} from "@/types/order";
import { useUpdateOrderStatus } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Loader2 } from "lucide-react";

interface OrderStatusActionsProps {
  order: Order;
}

/** Next-status label and variant mapping for the action buttons */
const NEXT_STATUS_CONFIG: Partial<
  Record<OrderStatus, { label: string; variant: "default" | "destructive" }>
> = {
  confirmed: { label: "Confirm Order", variant: "default" },
  preparing: { label: "Start Preparing", variant: "default" },
  ready: { label: "Mark Ready", variant: "default" },
  picked_up: { label: "Mark Picked Up", variant: "default" },
  completed: { label: "Complete Order", variant: "default" },
  cancelled: { label: "Cancel Order", variant: "destructive" },
};

export function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const { mutate, isPending } = useUpdateOrderStatus();
  const nextStatuses = VALID_NEXT_STATUSES[order.status] ?? [];

  // Terminal states — no actions available
  if (nextStatuses.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic">No actions</span>
    );
  }

  const handleUpdate = (newStatus: OrderStatus) => {
    const orderId = order.id || (order as any)._id;
    if (!orderId) return;
    mutate({ orderId, payload: { status: newStatus } });
  };

  // If there's only one action, show it as a primary button (even if it's 'cancelled')
  if (nextStatuses.length === 1) {
    const status = nextStatuses[0];
    const config = NEXT_STATUS_CONFIG[status];
    return (
      <Button
        variant={config?.variant ?? "default"}
        size="sm"
        disabled={isPending}
        onClick={() => handleUpdate(status)}
        className="cursor-pointer h-7 text-xs"
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          config?.label ?? ORDER_STATUS_LABELS[status]
        )}
      </Button>
    );
  }

  // Multiple actions: show the non-cancelled one as primary, 'cancelled' in dropdown
  const primaryNext = nextStatuses.find((s) => s !== "cancelled");
  const canCancel = nextStatuses.includes("cancelled");

  return (
    <div className="flex items-center gap-2">
      {primaryNext && (
        <Button
          variant={NEXT_STATUS_CONFIG[primaryNext]?.variant ?? "default"}
          size="sm"
          disabled={isPending}
          onClick={() => handleUpdate(primaryNext)}
          className="cursor-pointer h-7 text-xs"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            NEXT_STATUS_CONFIG[primaryNext]?.label ??
            ORDER_STATUS_LABELS[primaryNext]
          )}
        </Button>
      )}

      {canCancel && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="cursor-pointer h-7 text-xs"
            >
              More
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Other actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              disabled={isPending}
              onClick={() => handleUpdate("cancelled")}
            >
              Cancel Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
