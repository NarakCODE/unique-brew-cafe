import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
} from "lucide-react";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardStats } from "@/types/report";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations, useFormatter } from "next-intl";

interface SectionCardsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function SectionCards({ stats, isLoading }: SectionCardsProps) {
  const t = useTranslations("Dashboard.Stats");
  const format = useFormatter();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("totalRevenue")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {format.number(stats?.totalRevenue ?? 0, {
              style: "currency",
              currency: "USD",
            })}
          </CardTitle>
          <CardAction>
            <div className="p-2 bg-primary/10 rounded-full">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">{t("totalRevenueDesc")}</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("totalOrders")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {format.number(stats?.totalOrders ?? 0)}
          </CardTitle>
          <CardAction>
            <div className="p-2 bg-primary/10 rounded-full">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">{t("totalOrdersDesc")}</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("activeUsers")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {format.number(stats?.activeUsers ?? 0)}
          </CardTitle>
          <CardAction>
            <div className="p-2 bg-primary/10 rounded-full">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">{t("activeUsersDesc")}</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("topProductsRevenue")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {format.number(stats?.topProductsAmount ?? 0, {
              style: "currency",
              currency: "USD",
            })}
          </CardTitle>
          <CardAction>
            <div className="p-2 bg-primary/10 rounded-full">
              <Package className="w-5 h-5 text-primary" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {t("topProductsRevenueDesc")}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
