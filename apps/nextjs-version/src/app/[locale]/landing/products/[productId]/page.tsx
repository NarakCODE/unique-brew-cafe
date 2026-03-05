import type { Metadata } from "next";
import { ProductDetailPageContent } from "./product-detail-page-content";

export const metadata: Metadata = {
  title: "Product Details | Unique Brew Café",
  description:
    "Explore product details, pricing, nutrition, and customization options from Unique Brew Café.",
};

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { productId } = await params;
  return <ProductDetailPageContent productId={productId} />;
}
