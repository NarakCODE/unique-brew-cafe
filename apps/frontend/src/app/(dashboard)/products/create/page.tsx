import { Metadata } from "next";
import { ProductForm } from "../product-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
    title: "Create Product | Unique Brew Cafe",
    description: "Add a new product to your menu",
};

export default function CreateProductPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Product"
                description="Add a new product to your menu"
            />
            <ProductForm mode="create" />
        </div>
    );
}
