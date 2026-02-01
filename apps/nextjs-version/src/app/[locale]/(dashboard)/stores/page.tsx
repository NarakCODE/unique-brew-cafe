"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStores } from "@/hooks/use-stores";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { Loader2, Store as StoreIcon, Plus } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function StoresPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") || undefined;
  const sortOrder =
    (searchParams.get("sortOrder") as "asc" | "desc") || undefined;
  const isActive = searchParams.get("isActive")
    ? searchParams.get("isActive") === "true"
    : undefined;
  const city = searchParams.get("city") || undefined;

  const { stores, pagination, isLoading } = useStores({
    page,
    limit,
    search,
    sortOrder,
    isActive,
    city,
  });

  return (
    <div className="flex h-full flex-1 flex-col space-y-4 md:flex">
      <div className="flex items-end justify-between">
        <PageHeader
          title="Stores"
          description="Manage your stores and view their details."
        />
        <Button asChild>
          <Link href="/stores/new">
            <Plus />
            Add New
          </Link>
        </Button>
      </div>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <TableSkeleton rows={10} columns={5} />
        </div>
      ) : stores?.length === 0 ? (
        <Empty className="min-h-[50vh]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <StoreIcon className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No stores found</EmptyTitle>
            <EmptyDescription>
              There are no stores registered in the system yet.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/stores/new">Add Store</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable
          data={stores}
          columns={columns}
          pageCount={pagination?.pages ?? -1}
          page={page}
          limit={limit}
        />
      )}
    </div>
  );
}
