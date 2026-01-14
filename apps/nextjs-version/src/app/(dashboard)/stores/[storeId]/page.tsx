"use client";

import { PageHeader } from "@/components/page-header";
import { StoreForm } from "../components/store-form";
import { useStore } from "@/hooks/use-store";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function EditStorePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { store, isLoading } = useStore(storeId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center space-y-2">
        <h2 className="text-xl font-bold">Store not found</h2>
        <p className="text-muted-foreground">
          The store you are looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <PageHeader
          title="Edit Store"
          description={`Edit details for ${store.name}`}
        />
      </div>
      <StoreForm initialData={store} />
    </div>
  );
}
