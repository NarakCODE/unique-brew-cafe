"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LandingFooter } from "../../components/footer";
import { LandingNavbar } from "../../components/navbar";
import { Icons8Icon } from "../components/icons8-icon";
import { usePublicProduct } from "@/hooks/use-public-products";

interface ProductDetailPageContentProps {
  productId: string;
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

export function ProductDetailPageContent({
  productId,
}: ProductDetailPageContentProps) {
  const { product, isLoading, isError } = usePublicProduct(productId);
  const imageUrl = product ? getFirstImageUrl(product.images) : "";
  const category = product?.category || product?.categoryId;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/landing" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/landing/products"
            className="transition-colors hover:text-foreground"
          >
            Menu
          </Link>
          {product?.name ? (
            <>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </>
          ) : null}
        </div>

        {isLoading && (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        )}

        {isError && !isLoading && (
          <Card className="mx-auto max-w-xl rounded-3xl border-dashed p-8 text-center">
            <CardContent className="space-y-4 p-0">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <Icons8Icon name="warning" size={28} />
              </div>
              <h1 className="text-xl font-semibold">Product not available</h1>
              <p className="text-sm text-muted-foreground">
                We could not load this product right now. Please try again from
                the menu page.
              </p>
              <Button asChild variant="outline">
                <Link href="/landing/products">Back to Menu</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {product && !isLoading && (
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <section className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl border bg-card">
                <div className="aspect-[4/3] bg-muted">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={imageUrl} alt={product.name} className="object-cover" />
                    <AvatarFallback className="rounded-none bg-gradient-to-br from-primary/15 to-primary/5 text-6xl text-primary">
                      {product.name?.charAt(0)?.toUpperCase() || "P"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {product.isFeatured && (
                    <Badge className="gap-1 border-0 bg-amber-500 text-white">
                      <Icons8Icon name="sparkles" size={14} className="invert" />
                      Featured
                    </Badge>
                  )}
                  {product.isBestSelling && (
                    <Badge className="gap-1 border-0 bg-blue-600 text-white">
                      <Icons8Icon name="line-chart" size={14} className="invert" />
                      Best Seller
                    </Badge>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border bg-card p-6">
                <h2 className="mb-2 text-lg font-semibold">Product Story</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description ||
                    "Freshly prepared in small batches with balanced flavor and premium ingredients."}
                </p>
              </div>

              <div className="rounded-3xl border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Details</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-background p-4">
                    <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Preparation Time
                    </p>
                    <p className="inline-flex items-center gap-2 text-sm font-medium">
                      <Icons8Icon name="clock" size={14} />
                      {product.preparationTime ? `${product.preparationTime} min` : "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-background p-4">
                    <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Calories
                    </p>
                    <p className="inline-flex items-center gap-2 text-sm font-medium">
                      <Icons8Icon name="fire" size={14} />
                      {product.calories ? `${product.calories} kcal` : "N/A"}
                    </p>
                  </div>
                </div>

                {product.allergens?.length ? (
                  <>
                    <Separator className="my-5" />
                    <div>
                      <h3 className="mb-2 text-sm font-semibold">Allergens</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.allergens.map((allergen: string) => (
                          <Badge
                            key={allergen}
                            variant="destructive"
                            className="h-auto border-destructive/20 bg-destructive/10 px-2 py-1 text-xs text-destructive"
                          >
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {product.tags?.length ? (
                  <>
                    <Separator className="my-5" />
                    <div>
                      <h3 className="mb-2 text-sm font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="h-auto px-2 py-1 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </section>

            <aside className="lg:sticky lg:top-24">
              <Card className="rounded-3xl border bg-card shadow-sm">
                <CardContent className="space-y-5 p-6">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {category?.name || "Menu Item"}
                    </p>
                    <h1 className="text-3xl font-semibold leading-tight [font-family:Georgia,ui-serif,serif]">
                      {product.name}
                    </h1>
                  </div>

                  <div className="rounded-2xl border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Price
                    </p>
                    <p className="mt-1 text-3xl font-semibold">
                      {formatPrice(product.basePrice, product.currency)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border bg-background p-3">
                      <p className="mb-1 text-xs text-muted-foreground">Rating</p>
                      <p className="inline-flex items-center gap-1 font-medium">
                        <Icons8Icon name="star" size={14} />
                        {product.rating ? product.rating.toFixed(1) : "-"}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-background p-3">
                      <p className="mb-1 text-xs text-muted-foreground">Reviews</p>
                      <p className="font-medium">{product.totalReviews || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="h-11 w-full">Order Now</Button>
                    <Button variant="outline" className="h-11 w-full" asChild>
                      <Link href="/landing/products">Browse More Items</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
