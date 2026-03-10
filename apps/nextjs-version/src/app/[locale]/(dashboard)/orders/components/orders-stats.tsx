"use client";

import { useOrders } from "@/hooks/use-orders";
import { OrderStatus } from "@/types/order";
import { ShoppingBag, Clock, Coffee, CheckCircle } from "lucide-react";

const ACTIVE_STATUSES: OrderStatus[] = [
  "pending_payment",
  "confirmed",
  "preparing",
  "ready",
];

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
}

function StatCard({ label, value, icon, color, isLoading }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className={`rounded-full p-2.5 ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {isLoading ? (
          <div className="h-6 w-10 bg-muted animate-pulse rounded mt-0.5" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </div>
    </div>
  );
}

export function OrdersStats() {
  const { orders: allOrders, isLoading } = useOrders({ limit: 200 });
  const { orders: activeOrders, isLoading: activeLoading } = useOrders({
    limit: 200,
  });

  const pending = allOrders.filter(
    (o) => o.status === "pending_payment",
  ).length;
  const active = activeOrders.filter((o) =>
    ACTIVE_STATUSES.includes(o.status),
  ).length;
  const ready = allOrders.filter((o) => o.status === "ready").length;
  const completed = allOrders.filter((o) => o.status === "completed").length;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        label="New Orders"
        value={pending}
        icon={<ShoppingBag className="h-5 w-5 text-amber-600" />}
        color="bg-amber-50 dark:bg-amber-400/10"
        isLoading={isLoading}
      />
      <StatCard
        label="In Progress"
        value={active}
        icon={<Coffee className="h-5 w-5 text-violet-600" />}
        color="bg-violet-50 dark:bg-violet-400/10"
        isLoading={activeLoading}
      />
      <StatCard
        label="Ready for Pickup"
        value={ready}
        icon={<Clock className="h-5 w-5 text-green-600" />}
        color="bg-green-50 dark:bg-green-400/10"
        isLoading={isLoading}
      />
      <StatCard
        label="Completed Today"
        value={completed}
        icon={<CheckCircle className="h-5 w-5 text-teal-600" />}
        color="bg-teal-50 dark:bg-teal-400/10"
        isLoading={isLoading}
      />
    </div>
  );
}
