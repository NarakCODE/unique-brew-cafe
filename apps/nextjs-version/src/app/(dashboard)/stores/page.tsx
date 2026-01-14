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
    <div className="flex h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <PageHeader
          title="Stores"
          description="Manage your stores and view their details."
        />
        <Button asChild>
          <Link href="/stores/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Store
          </Link>
        </Button>
      </div>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
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
