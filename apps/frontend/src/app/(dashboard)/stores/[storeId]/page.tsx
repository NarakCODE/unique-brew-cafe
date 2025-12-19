"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StoreForm } from "@/components/stores/store-form";
import { useStore } from "@/hooks/use-stores";

export default function StoreDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const storeId = params.storeId as string;

    const { data: store, isLoading, error } = useStore(storeId);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 pt-16">
                <p className="text-muted-foreground">
                    Failed to load store details.
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Edit Store"
                description={`Edit details for ${store.name}`}
            >
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </PageHeader>
            <div className="mt-8">
                <StoreForm initialData={store} />
            </div>
        </div>
    );
}
