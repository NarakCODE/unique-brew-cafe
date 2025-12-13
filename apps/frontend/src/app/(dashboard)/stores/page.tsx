"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { useAdminStores } from "@/hooks/use-stores";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";

export default function StoresPage() {
    const { data: response, isLoading } = useAdminStores({
        // caching and updating is handled by react-query
    });

    const stores = response?.data || [];
    const uniqueCities = Array.from(new Set(stores.map((s) => s.city))).filter(
        Boolean
    );

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="Stores" description="Manage your stores here.">
                <Button asChild>
                    <Link href="/stores/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Store
                    </Link>
                </Button>
            </PageHeader>
            <DataTable
                data={stores}
                columns={columns}
                searchKey="name"
                filters={[
                    {
                        columnId: "city",
                        title: "City",
                        options: uniqueCities.map((city) => ({
                            label: city,
                            value: city,
                        })),
                    },
                    {
                        columnId: "isActive",
                        title: "Status",
                        options: [
                            { label: "Active", value: "true" },
                            { label: "Inactive", value: "false" },
                        ],
                    },
                ]}
            />
        </div>
    );
}
