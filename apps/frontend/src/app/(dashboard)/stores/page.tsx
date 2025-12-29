import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StoresTable } from "./stores-table";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";

export default function StoresPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="Stores" description="Manage your stores here.">
                <Button asChild>
                    <Link href="/stores/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Store
                    </Link>
                </Button>
            </PageHeader>
            <Suspense fallback={<div>Loading stores...</div>}>
                <StoresTable />
            </Suspense>
        </div>
    );
}
