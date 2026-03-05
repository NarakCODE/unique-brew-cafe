"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePublicProduct } from "@/hooks/use-public-products";
import { Icons8Icon } from "./icons8-icon";

interface ProductDetailDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getFirstImageUrl(images: unknown): string {
  if (!images) return "";

  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return String(parsed[0] ?? "");
      return String(parsed ?? "");
    } catch {
      return images;
    }
  }

  if (Array.isArray(images)) {
    const first = images[0];
    if (!first) return "";
    if (typeof first === "string") {
      const trimmed = first.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith('"')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return String(parsed[0] ?? "");
          return String(parsed ?? "");
        } catch {
          return first;
        }
      }
      return first;
    }
    return String(first);
  }

  return "";
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(price ?? 0);
}

export function ProductDetailDialog({
  productId,
  open,
  onOpenChange,
}: ProductDetailDialogProps) {
  const { product, isLoading, isError } = usePublicProduct(productId);
  const imageUrl = product ? getFirstImageUrl(product.images) : "";
  const category = product?.category || product?.categoryId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product?.name ?? "Product Details"}</DialogTitle>
          <DialogDescription>
            Full details about this menu item
          </DialogDescription>
        </DialogHeader>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
          onClick={() => onOpenChange(false)}
          aria-label="Close dialog"
        >
          <Icons8Icon name="close" size={16} />
        </Button>

        <ScrollArea className="max-h-[90vh]">
          {isLoading && (
            <div className="space-y-6 p-6">
              <Skeleton className="aspect-[16/9] w-full rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center text-muted-foreground">
              <Icons8Icon name="warning" size={48} className="mb-3 opacity-70" />
              <p className="font-medium">Failed to load product details</p>
              <p className="mt-1 text-sm">Please try again later.</p>
            </div>
          )}

          {product && !isLoading && (
            <div className="pb-6">
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage
                    src={imageUrl}
                    alt={product.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-none bg-gradient-to-br from-primary/10 to-primary/5 text-6xl text-primary">
                    {product.name?.charAt(0)?.toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>

                <div className="absolute bottom-4 left-4 flex gap-2">
                  {product.isFeatured && (
                    <Badge className="gap-1 border-0 bg-amber-500/90 text-white shadow-md backdrop-blur-sm">
                      <Icons8Icon name="sparkles" size={14} className="invert" />
                      Featured
                    </Badge>
                  )}
                  {product.isBestSelling && (
                    <Badge className="gap-1 border-0 bg-blue-500/90 text-white shadow-md backdrop-blur-sm">
                      <Icons8Icon name="line-chart" size={14} className="invert" />
                      Best Seller
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-5 px-6 pt-5">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {product.name}
                  </h2>
                  {category && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span>{category.icon || "☕"}</span>
                      <span>{category.name}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="flex flex-col justify-center rounded-lg border bg-card p-3 shadow-sm">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                      <Icons8Icon name="dollar" size={14} />
                      Price
                    </div>
                    <div className="text-lg font-bold">
                      {formatPrice(product.basePrice, product.currency)}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center rounded-lg border bg-card p-3 shadow-sm">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                      <Icons8Icon name="clock" size={14} />
                      Prep Time
                    </div>
                    <div className="text-lg font-bold">
                      {product.preparationTime
                        ? `${product.preparationTime} min`
                        : "-"}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center rounded-lg border bg-card p-3 shadow-sm">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                      <Icons8Icon name="fire" size={14} />
                      Calories
                    </div>
                    <div className="text-lg font-bold">
                      {product.calories ? `${product.calories} kcal` : "N/A"}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center rounded-lg border bg-card p-3 shadow-sm">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                      <Icons8Icon name="star" size={14} />
                      Rating
                    </div>
                    <div className="text-lg font-bold">
                      {product.rating ? product.rating.toFixed(1) : "-"}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        ({product.totalReviews || 0})
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {product.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">About this item</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Icons8Icon name="tag" size={14} />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {product.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="h-auto px-2 py-0.5 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.allergens && product.allergens.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Icons8Icon name="warning" size={14} />
                        Allergens
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {product.allergens.map((allergen: string) => (
                          <Badge
                            key={allergen}
                            variant="destructive"
                            className="h-auto border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs text-destructive hover:bg-destructive/20"
                          >
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
