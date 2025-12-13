"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ChartAreaInteractive } from "@/components/shared/chart-area-interactive";
import { SectionCards } from "@/components/shared/section-cards";
import { useDashboardStats } from "@/hooks/use-dashboard";

export default function DashboardPage() {
    const { data: stats, isLoading } = useDashboardStats();

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="Dashboard"
                description="Overview of your store performance."
            />
            <div className="flex flex-col gap-4">
                <SectionCards stats={stats} isLoading={isLoading} />
                <ChartAreaInteractive />
            </div>
        </div>
    );
}
