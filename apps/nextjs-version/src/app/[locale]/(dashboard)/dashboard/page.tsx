"use client";

import dynamic from "next/dynamic";
import {
  useDashboardStats,
  useSalesReport,
  useProductPerformance,
} from "@/hooks/use-report";
import { useTranslations } from "next-intl";

const SectionCards = dynamic(
  () => import("./components/section-cards").then((mod) => mod.SectionCards),
);
const ChartAreaInteractive = dynamic(
  () =>
    import("./components/chart-area-interactive").then(
      (mod) => mod.ChartAreaInteractive,
    ),
);
const ProductPerformanceTable = dynamic(
  () =>
    import("./components/product-performance-table").then(
      (mod) => mod.ProductPerformanceTable,
    ),
);

export default function Page() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const {
    sales,
    isLoading: salesLoading,
    isFetching: salesRefreshing,
    refetch: refetchSales,
  } = useSalesReport({ groupBy: "day" });
  const { products, isLoading: productsLoading } = useProductPerformance();

  const t = useTranslations("Dashboard");

  return (
    <>
      <div className="">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="@container/main space-y-6">
        <SectionCards stats={stats} isLoading={statsLoading} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <ChartAreaInteractive
              data={sales}
              isLoading={salesLoading}
              isRefreshing={salesRefreshing}
              onRefresh={() => refetchSales()}
            />
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
