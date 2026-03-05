"use client";

import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/use-products";
import { DataTable } from "./components/data-table";
import { getColumns } from "./components/columns";
import { Package, Plus } from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";
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
import { CreateProductDialog } from "./components/create-product-dialog";
import { useTranslations } from "next-intl";
import { parseDashboardProductsQuery } from "@/lib/query-schemas";

export default function ProductsPage() {
  const t = useTranslations("Products");
  const searchParams = useSearchParams();
  const { page, limit, search } = parseDashboardProductsQuery(searchParams);

  const { products, isLoading } = useProducts({
    page,
    limit,
    search,
  });

  return (
    <div className="flex h-full flex-1 flex-col space-y-4 md:flex">
      <div className="flex items-end justify-between">
        <PageHeader title={t("title")} description={t("description")} />
        <CreateProductDialog>
          <Button>
            <Plus />
            {t("addProduct")}
          </Button>
        </CreateProductDialog>
      </div>
      {isLoading ? (
        <TableSkeleton rows={10} columns={5} />
      ) : products?.length === 0 ? (
        <Empty className="min-h-[50vh]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>{t("noProductsFound")}</EmptyTitle>
            <EmptyDescription>{t("noProductsDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateProductDialog>
              <Button>{t("addProduct")}</Button>
            </CreateProductDialog>
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable data={products} columns={getColumns(t)} />
      )}
    </div>
  );
}
