"use client";

import { format } from "date-fns";
import {
  Clock,
  Flame,
  Star,
  Tag,
  AlertTriangle,
  Package,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  Layers,
  Utensils,
} from "lucide-react";

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
import { useProduct } from "@/hooks/use-products";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductDetailsDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** * robustly extracts the first image URL from various API serialization shapes
 * specifically handles the case: ["[\"https://...\"]"]
 */
function getFirstImageUrl(images: unknown): string {
  if (!images) return "";

  // Case: string directly
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return String(parsed[0] ?? "");
      return String(parsed ?? "");
    } catch {
      return images;
    }
  }

  // Case: array of strings or stringified JSON
  if (Array.isArray(images)) {
    const first = images[0];
    if (!first) return "";

    if (typeof first === "string") {
      const trimmed = first.trim();
      // Handle double-serialized JSON: ["[\"url\"]"]
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

export function ProductDetailsDialog({
  productId,
  open,
  onOpenChange,
}: ProductDetailsDialogProps) {
  // Assuming useProduct returns the 'data' object from your JSON as 'product'
  const { product, isLoading, isError } = useProduct(productId);

  const imageUrl = product ? getFirstImageUrl(product.images) : "";

  // Fallback for category since your JSON has both 'category' and 'categoryId' populated
  const category = product?.category || product?.categoryId;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(price ?? 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Product Details</DialogTitle>
          <DialogDescription>
            Full specifications for this item
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          {isLoading && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <Skeleton className="h-24 w-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 text-destructive/50 mb-3" />
              <p>Unable to load product information.</p>
            </div>
          )}

          {product && !isLoading && (
            <div className="space-y-6 pb-6">
              {/* --- HEADER: Image, Name, Category, Badges --- */}
              <div className="flex flex-col md:flex-row gap-5">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 rounded-lg border bg-muted">
                  <AvatarImage
                    src={imageUrl}
                    alt={product.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg text-3xl bg-primary/5 text-primary">
                    {product.name?.charAt(0)?.toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      {category && (
                        <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded text-xs font-medium">
                          <span>{category.icon || "📦"}</span>
                          <span>{category.name}</span>
                        </span>
                      )}
                      {product.slug && (
                        <span className="text-xs font-mono opacity-70">
                          #{product.slug}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={product.isAvailable ? "default" : "destructive"}
                      className="gap-1 pl-1.5"
                    >
                      {product.isAvailable ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {product.isAvailable ? "Available" : "Unavailable"}
                    </Badge>

                    {product.isFeatured && (
                      <Badge
                        variant="secondary"
                        className="gap-1 text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Featured
                      </Badge>
                    )}

                    {product.isBestSelling && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-blue-200 text-blue-700 bg-blue-50"
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                        Best Seller
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* --- STATS GRID --- */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex flex-col justify-center p-3 rounded-lg bg-card border shadow-sm">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs font-medium uppercase">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" /> Price
                  </div>
                  <div className="text-lg font-bold">
                    {formatPrice(product.basePrice, product.currency)}
                  </div>
                </div>

                <div className="flex flex-col justify-center p-3 rounded-lg bg-card border shadow-sm">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs font-medium uppercase">
                    <Clock className="h-3.5 w-3.5 text-blue-500" /> Prep Time
                  </div>
                  <div className="text-lg font-bold">
                    {product.preparationTime
                      ? `${product.preparationTime} min`
                      : "-"}
                  </div>
                </div>

                <div className="flex flex-col justify-center p-3 rounded-lg bg-card border shadow-sm">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs font-medium uppercase">
                    <Flame className="h-3.5 w-3.5 text-orange-500" /> Calories
                  </div>
                  <div className="text-lg font-bold">
                    {product.calories ? `${product.calories} kcal` : "N/A"}
                  </div>
                </div>

                <div className="flex flex-col justify-center p-3 rounded-lg bg-card border shadow-sm">
                  <div className="flex items-center gap-2 mb-1 text-muted-foreground text-xs font-medium uppercase">
                    <Star className="h-3.5 w-3.5 text-yellow-500" /> Reviews
                  </div>
                  <div className="text-lg font-bold">
                    {product.rating ? product.rating.toFixed(1) : "-"}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({product.totalReviews || 0})
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* --- DESCRIPTION --- */}
              {product.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    Description
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* --- META LISTS: Tags, Allergens, Customizations --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tags & Allergens */}
                <div className="space-y-4">
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" /> TAGS
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {product.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-2 py-0.5 h-auto"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.allergens && product.allergens.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> ALLERGENS
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {product.allergens.map((allergen: string) => (
                          <Badge
                            key={allergen}
                            variant="destructive"
                            className="text-xs px-2 py-0.5 h-auto bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                          >
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Customizations & Addons (from your JSON structure) */}
                <div className="space-y-4">
                  {(product?.customizations?.length ?? 0) > 0 ||
                  (product?.addOns?.length ?? 0) > 0 ? (
                    <>
                      {(product?.customizations?.length ?? 0) > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Utensils className="h-3.5 w-3.5" /> CUSTOMIZATIONS
                          </h4>
                          <div className="text-sm text-muted-foreground">
                            {product.customizations?.length ?? 0} options
                            available
                          </div>
                        </div>
                      )}
                      {(product?.addOns?.length ?? 0) > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5" /> ADD-ONS
                          </h4>
                          <div className="text-sm text-muted-foreground">
                            {product.addOns?.length ?? 0} add-ons available
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center rounded-lg border border-dashed p-4">
                      <p className="text-xs text-muted-foreground text-center">
                        No customizations or add-ons configured.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* --- FOOTER META --- */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                <div className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  <span>Display Order: {product.displayOrder ?? "-"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Created:{" "}
                    {product.createdAt
                      ? format(new Date(product.createdAt), "PPP")
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Updated:{" "}
                    {product.updatedAt
                      ? format(new Date(product.updatedAt), "PPP")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
