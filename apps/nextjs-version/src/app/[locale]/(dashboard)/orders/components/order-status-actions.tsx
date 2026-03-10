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

  // Single next step: show an inline button for the primary action
  const primaryNext = nextStatuses.find((s) => s !== "cancelled");
  const canCancel = nextStatuses.includes("cancelled");

  const handleUpdate = (newStatus: OrderStatus) => {
    mutate({ orderId: order.id, payload: { status: newStatus } });
  };

  return (
    <div className="flex items-center gap-2">
      {primaryNext && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => handleUpdate(primaryNext)}
          className="cursor-pointer h-7 text-xs"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            (NEXT_STATUS_CONFIG[primaryNext]?.label ??
            ORDER_STATUS_LABELS[primaryNext])
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
