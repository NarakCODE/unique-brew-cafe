import { OrdersList } from "./components/orders-list";
import { OrdersStats } from "./components/orders-stats";

export const metadata = {
  title: "Orders | Unique Brew Cafe",
  description:
    "Manage and track customer orders. Update order status through the coffee preparation workflow.",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage customer orders through the preparation workflow.
        </p>
      </div>

      {/* Quick stats */}
      <OrdersStats />

      {/* Orders table with status actions */}
      <OrdersList />
    </div>
  );
}
