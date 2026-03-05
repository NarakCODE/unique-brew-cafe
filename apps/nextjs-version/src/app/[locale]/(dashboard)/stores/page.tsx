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
import { useTranslations } from "next-intl";
import { parseDashboardStoresQuery } from "@/lib/query-schemas";

export default function StoresPage() {
  const t = useTranslations("Stores");
  const searchParams = useSearchParams();
  const { page, limit, search, sortOrder, isActive, city } =
    parseDashboardStoresQuery(searchParams);

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
        <PageHeader title={t("title")} description={t("description")} />
        <Button asChild>
          <Link href="/stores/new">
            <Plus />
            {t("addNew")}
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
            <EmptyTitle>{t("noStoresFound")}</EmptyTitle>
            <EmptyDescription>{t("noStoresDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/stores/new">{t("addStore")}</Link>
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
