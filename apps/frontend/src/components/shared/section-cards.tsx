import {
    IconTrendingUp,
    IconShoppingCart,
    IconUsers,
    IconChartBar,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats } from "@/types";

interface SectionCardsProps {
    stats?: DashboardStats;
    isLoading?: boolean;
}

export function SectionCards({ stats, isLoading }: SectionCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        $
                        {stats?.totalRevenue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }) ?? "0.00"}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconTrendingUp />
                            +12.5%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Trending up this month{" "}
                        <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Revenue for the period
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Total Orders</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats?.totalOrders.toLocaleString() ?? "0"}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconShoppingCart />
                            +5%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Orders processed <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Total completed orders
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Active Accounts</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats?.activeUsers.toLocaleString() ?? "0"}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconUsers />
                            +2%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Active users <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Currently active on platform
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Top Product</CardDescription>
                    <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl truncate">
                        {stats?.topProducts ?? "N/A"}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconChartBar />
                            Top
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {stats?.topProducts ?? "0"} sold
                        <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Best selling item
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
