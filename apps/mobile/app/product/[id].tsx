import { Stack, useLocalSearchParams } from "expo-router";

import { ProductDetailView } from "@/components/product/product-detail-view";

export default function ProductDetailRoute() {
  const params = useLocalSearchParams<{ id?: string }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />
      <ProductDetailView productId={productId} presentation="screen" />
    </>
  );
}
