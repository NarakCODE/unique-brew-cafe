"use client";

import { useCategories } from "@/hooks/use-categories";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { Loader2, Coffee } from "lucide-react";
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

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 md:flex">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Categories"
          description="Manage your product categories."
        />
      </div>
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : categories?.length === 0 ? (
        <Empty className="min-h-[50vh]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Coffee className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>No categories found</EmptyTitle>
            <EmptyDescription>
              There are no product categories in the system yet.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {/* Add button to create category later if needed */}
            <Button disabled>Create Category</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <DataTable data={categories || []} columns={columns} />
      )}
    </div>
  );
}
