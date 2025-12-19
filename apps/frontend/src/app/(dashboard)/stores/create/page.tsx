"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StoreForm } from "@/components/stores/store-form";

export default function StoreCreatePage() {
    const router = useRouter();

    return (
        <div>
            <PageHeader
                title="Create Store"
                description="Add a new store/branch to the system."
            >
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </PageHeader>
            <div className="mt-8">
                <StoreForm />
            </div>
        </div>
    );
}
