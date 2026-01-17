"use client";

import {
  useDashboardStats,
  useSalesReport,
  useProductPerformance,
} from "@/hooks/use-report";
import { ChartAreaInteractive } from "./components/chart-area-interactive";
import { SectionCards } from "./components/section-cards";
import { ProductPerformanceTable } from "./components/product-performance-table";

export default function Page() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { sales, isLoading: salesLoading } = useSalesReport({ groupBy: "day" });
  const { products, isLoading: productsLoading } = useProductPerformance();

  return (
    <>
      <div className="">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard
          </p>
        </div>
      </div>

      <div className="@container/main space-y-6">
        <SectionCards stats={stats} isLoading={statsLoading} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <ChartAreaInteractive data={sales} isLoading={salesLoading} />
          </div>
          <div className="col-span-3">
            <ProductPerformanceTable
              data={products}
              isLoading={productsLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
}
