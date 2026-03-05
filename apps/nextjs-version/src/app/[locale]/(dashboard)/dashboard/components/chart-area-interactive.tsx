/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SalesReportItem } from "@/types/report";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations, useFormatter } from "next-intl";
import { BarChart3, RefreshCw } from "lucide-react";

export const description = "An interactive area chart";

interface ChartAreaInteractiveProps {
  data?: SalesReportItem[];
  isLoading?: boolean;
}

export function ChartAreaInteractive({
  data = [],
  isLoading,
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const t = useTranslations("Dashboard.Chart");
  const format = useFormatter();

  const chartConfig = React.useMemo(
    () =>
      ({
        revenue: {
          label: t("revenue"),
          color: "hsl(var(--primary))",
        },
        orders: {
          label: t("orders"),
          color: "hsl(var(--chart-2))",
        },
      }) satisfies ChartConfig,
    [t],
  );

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  /*
    Note: The API currently returns data filtered by date range if provided.
    However, if we want to support client-side filtering (like the original component),
    we would need the API to return a larger dataset, or trigger a re-fetch when 'timeRange' changes.
    For simplicity and integration, we'll assume the parent component handles fetching
    based on the desired range, or we display what is given.
    Here, mapping the API data to the chart format.
  */

  const formattedData = React.useMemo(() => {
    return data.map((item) => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-62.5 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (formattedData.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>{t("totalSales")}</CardTitle>
          <CardDescription>{t("dailyRevenueAndOrders")}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Empty className="h-62.5 border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart3 className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No chart data available</EmptyTitle>
              <EmptyDescription>
                There is no sales data for the selected period yet.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{t("totalSales")}</CardTitle>
        <CardDescription>{t("dailyRevenueAndOrders")}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return format.dateTime(date, {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: any) => {
                    const date = new Date(value as string | number | Date);
                    return format.dateTime(date, {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
