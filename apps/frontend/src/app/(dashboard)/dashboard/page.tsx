"use client";

import { ChartAreaInteractive } from "@/components/shared/chart-area-interactive";
import { SectionCards } from "@/components/shared/section-cards";
import { SidebarInset } from "@/components/ui/sidebar";
import { useDashboardStats } from "@/hooks/use-dashboard";

export default function DashboardPage() {
    const { data: stats, isLoading } = useDashboardStats();

    return (
        <SidebarInset>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <SectionCards stats={stats} isLoading={isLoading} />
                        <div className="px-4 lg:px-6">
                            <ChartAreaInteractive />
                        </div>
                        {/* <DataTable data={data} /> */}
                    </div>
                </div>
            </div>
        </SidebarInset>
    );
}
