"use client";

import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/use-products";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { Loader2, Package, Plus } from "lucide-react";
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

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") || undefined;

  const { products, isLoading } = useProducts({
    page,
    limit,
    search,
  });

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 md:flex">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Products"
          description="Manage your products catalogue."
        />
        <CreateProductDialog>
          <Button>
            <Plus />
            Add Product
          </Button>
        </CreateProductDialog>
      </div>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : products?.length === 0 ? (
        <Empty className="min-h-[50vh]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No products found</EmptyTitle>
            <EmptyDescription>There are no products found.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateProductDialog>
              <Button>Add Product</Button>
            </CreateProductDialog>
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable data={products} columns={columns} />
      )}
    </div>
  );
}
