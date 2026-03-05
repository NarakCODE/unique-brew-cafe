import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BarChart3, RefreshCw } from "lucide-react";

export default function Dashboard2() {
  return (
    <div className="flex-1 space-y-6 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Business Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your business performance and key metrics in real-time
        </p>
      </div>

      <Empty className="min-h-[65vh] border border-dashed bg-card/40">
        <EmptyHeader className="max-w-xl">
          <EmptyMedia className="w-full">
            <Image
              src="/errors/empty-data.svg"
              alt="No dashboard data"
              width={960}
              height={540}
              className="aspect-video w-full max-w-lg rounded-xl object-contain opacity-20"
              priority
            />
          </EmptyMedia>
          <EmptyTitle>No business data yet</EmptyTitle>
          <EmptyDescription>
            Connect a data source or import transactions to populate analytics,
            revenue charts, and customer insights on this dashboard.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row flex-wrap justify-center">
          <Button asChild>
            <Link href="/dashboard">
              <RefreshCw className="mr-2 h-4 w-4" />
              Back to Main Dashboard
            </Link>
          </Button>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Configure Data Source
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
