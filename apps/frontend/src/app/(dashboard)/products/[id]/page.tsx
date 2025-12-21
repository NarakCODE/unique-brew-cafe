"use client";

import { useProduct } from "@/hooks/use-products";
import { ProductForm } from "../product-form";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EditProductPageProps {
    params: {
        id: string;
    };
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const { data: product, isLoading, isError, error } = useProduct(params.id);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Edit Product"
                    description="Update product information"
                />
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6 space-y-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="space-y-6">
                        {[1, 2].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6 space-y-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Edit Product"
                    description="Update product information"
                />
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error instanceof Error
                            ? error.message
                            : "Failed to load product. Please try again."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Edit Product"
                    description="Update product information"
                />
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Product not found.</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Edit: ${product.name}`}
                description="Update product information"
            />
            <ProductForm product={product} mode="edit" />
        </div>
    );
}
