"use client";

import {
  useDashboardStats,
  useSalesReport,
  useProductPerformance,
} from "@/hooks/use-report";
import { ChartAreaInteractive } from "./components/chart-area-interactive";
import { SectionCards } from "./components/section-cards";
import { ProductPerformanceTable } from "./components/product-performance-table";
// 1. Import both hooks
import { useTranslations, useFormatter } from "next-intl";

export default function Page() {
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { sales, isLoading: salesLoading } = useSalesReport({ groupBy: "day" });
  const { products, isLoading: productsLoading } = useProductPerformance();

  // 2. Initialize hooks
  const t = useTranslations("Dashboard");
  const format = useFormatter();

  return (
    <>
      <div className="">
        <div className="flex flex-col gap-2">
          {/* 3. usage of keys from your en.json */}
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="@container/main space-y-6">
        {/* Strategy A: Pass raw data.
           (Assuming SectionCards handles formatting internally)
        */}
        <SectionCards stats={stats} isLoading={statsLoading} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            {/* Strategy B: Pass translated labels if the component is generic.
                Example: title={t('salesChartTitle')}
             */}
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
