import { PageHeader } from "@/components/page-header";
import { TableSkeletonCard } from "@/components/ui/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-1 flex-col space-y-6">
      <PageHeader
        title="Loading Dashboard..."
        description="Preparing your latest data and widgets."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-5">
            <Skeleton className="mb-2 h-4 w-1/2" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border bg-card p-4">
          <Skeleton className="mb-2 h-5 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-3">
          <TableSkeletonCard rows={6} columns={3} />
        </div>
      </div>
    </div>
  );
}
