"use client";

import React from "react";
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
import { ProductCard } from "../components/product-card";
import { usePublicProduct, usePublicProducts } from "@/hooks/use-public-products";

interface ProductDetailPageContentProps {
  productId: string;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

interface ProductOptionGroup {
  id: string;
  name: string;
  options: ProductOption[];
}

function getImageUrls(images: unknown): string[] {
  if (!images) return [];

  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item ?? ""));
      return [String(parsed ?? "")];
    } catch {
      return [images];
    }
  }

  if (Array.isArray(images)) {
    const values = images.flatMap((item) => {
      if (!item) return [];
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed.startsWith("[") || trimmed.startsWith('"')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.map((value) => String(value ?? ""));
            return [String(parsed ?? "")];
          } catch {
            return [item];
          }
        }
        return [item];
      }
      return [String(item)];
    });

    return values.filter(Boolean);
  }

  return [];
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseOptionItem(item: unknown, index: number): ProductOption | null {
  if (!item || typeof item !== "object") return null;

  const record = item as Record<string, unknown>;
  const name =
    String(record.name ?? record.label ?? record.title ?? "").trim() ||
    `Option ${index + 1}`;

  const id = String(record._id ?? record.id ?? `${name}-${index}`);
  const price = toNumber(record.price ?? record.additionalPrice ?? record.amount);

  return { id, name, price };
}

function parseOptionGroups(
  input: unknown,
  fallbackGroupName: string,
): ProductOptionGroup[] {
  if (!Array.isArray(input) || input.length === 0) return [];

  const groups: ProductOptionGroup[] = [];

  input.forEach((rawGroup, groupIndex) => {
    if (!rawGroup || typeof rawGroup !== "object") return;

    const group = rawGroup as Record<string, unknown>;
    const optionsRaw = Array.isArray(group.options) ? group.options : [];
    const parsedOptions = optionsRaw
      .map((option, optionIndex) => parseOptionItem(option, optionIndex))
      .filter((option): option is ProductOption => Boolean(option));

    if (parsedOptions.length > 0) {
      groups.push({
        id: String(group._id ?? group.id ?? `group-${groupIndex}`),
        name:
          String(group.name ?? group.label ?? group.title ?? "").trim() ||
          `${fallbackGroupName} ${groupIndex + 1}`,
        options: parsedOptions,
      });
      return;
    }

    const asOption = parseOptionItem(group, groupIndex);
    if (!asOption) return;

    const existingGroup = groups.find(
      (existing) => existing.name === fallbackGroupName,
    );
    if (existingGroup) {
      existingGroup.options.push(asOption);
      return;
    }

    groups.push({
      id: `${fallbackGroupName.toLowerCase()}-default`,
      name: fallbackGroupName,
      options: [asOption],
    });
  });

  return groups;
}

function getFirstImageUrl(images: unknown): string {
  const parsed = getImageUrls(images);
  return parsed[0] ?? "";
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(price ?? 0);
}

function getProductKey(productId: string, fallbackId: string) {
  return productId || fallbackId;
}

export function ProductDetailPageContent({
  productId,
}: ProductDetailPageContentProps) {
  const [selectedImage, setSelectedImage] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [selectedCustomization, setSelectedCustomization] = React.useState<
    Record<string, string>
  >({});
  const [selectedAddOns, setSelectedAddOns] = React.useState<string[]>([]);

  const { product, isLoading, isError } = usePublicProduct(productId);
  const images = React.useMemo(
    () => (product ? getImageUrls(product.images) : []),
    [product],
  );
  const imageUrl = images[0] ?? "";
  const category = product?.category || product?.categoryId;
  const categoryId = category?._id;

  const customizationGroups = React.useMemo(
    () => parseOptionGroups(product?.customizations, "Customizations"),
    [product?.customizations],
  );
  const addOnGroups = React.useMemo(
    () => parseOptionGroups(product?.addOns, "Add-ons"),
    [product?.addOns],
  );
  const addOnOptions = React.useMemo(
    () => addOnGroups.flatMap((group) => group.options),
    [addOnGroups],
  );

  React.useEffect(() => {
    setSelectedImage(images[0] ?? "");
  }, [images]);

  React.useEffect(() => {
    if (customizationGroups.length === 0) {
      setSelectedCustomization({});
      return;
    }

    setSelectedCustomization((previous) => {
      const next: Record<string, string> = {};
      customizationGroups.forEach((group) => {
        const existing = previous[group.id];
        const hasExisting = group.options.some((option) => option.id === existing);
        next[group.id] = hasExisting ? existing : group.options[0].id;
      });
      return next;
    });
  }, [customizationGroups]);

  React.useEffect(() => {
    setQuantity(1);
    setSelectedAddOns([]);
  }, [product?._id, product?.id]);

  const relatedFilters = React.useMemo(
    () =>
      categoryId
        ? {
            categoryId,
            limit: 8,
            sortBy: "displayOrder",
            sortOrder: "asc" as const,
          }
        : { limit: 8, isBestSelling: true },
    [categoryId],
  );

  const { products: relatedRawProducts, isLoading: isRelatedLoading } =
    usePublicProducts(relatedFilters);

  const productPrimaryId = product ? getProductKey(product._id, product.id) : "";
  const relatedProducts = relatedRawProducts
    .filter((item) => getProductKey(item._id, item.id) !== productPrimaryId)
    .slice(0, 4);

  const selectedCustomizationPrice = customizationGroups.reduce(
    (sum, group) => {
      const selectedId = selectedCustomization[group.id];
      const selected = group.options.find((option) => option.id === selectedId);
      return sum + (selected?.price ?? 0);
    },
    0,
  );

  const selectedAddOnPrice = selectedAddOns.reduce((sum, addOnId) => {
    const selected = addOnOptions.find((option) => option.id === addOnId);
    return sum + (selected?.price ?? 0);
  }, 0);

  const basePrice = product?.basePrice ?? 0;
  const linePrice = basePrice + selectedCustomizationPrice + selectedAddOnPrice;
  const totalPrice = linePrice * quantity;

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((previous) =>
      previous.includes(addOnId)
        ? previous.filter((id) => id !== addOnId)
        : [...previous, addOnId],
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      <main className="container mx-auto px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-12">
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
              <span className="line-clamp-1 text-foreground">{product.name}</span>
            </>
          ) : null}
        </div>

        {isLoading && (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-3xl" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square rounded-xl" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
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
          <>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <section className="space-y-6">
                <div className="overflow-hidden rounded-3xl border bg-card">
                  <div className="relative aspect-square bg-muted">
                    <Avatar className="h-full w-full rounded-none">
                      <AvatarImage
                        src={selectedImage || imageUrl}
                        alt={product.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-none bg-gradient-to-br from-primary/15 to-primary/5 text-6xl text-primary">
                        {product.name?.charAt(0)?.toUpperCase() || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {product.isFeatured && (
                        <Badge className="gap-1 border-0 bg-amber-500 text-white">
                          <Icons8Icon
                            name="sparkles"
                            size={14}
                            className="invert"
                          />
                          Featured
                        </Badge>
                      )}
                      {product.isBestSelling && (
                        <Badge className="gap-1 border-0 bg-blue-600 text-white">
                          <Icons8Icon
                            name="line-chart"
                            size={14}
                            className="invert"
                          />
                          Best Seller
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {images.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className={`overflow-hidden rounded-xl border transition ${
                          (selectedImage || imageUrl) === image
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border/70 hover:border-primary/50"
                        }`}
                        aria-label={`Select image ${index + 1}`}
                      >
                        <Avatar className="h-full w-full rounded-none">
                          <AvatarImage
                            src={image}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            className="aspect-square object-cover"
                          />
                          <AvatarFallback className="rounded-none">IMG</AvatarFallback>
                        </Avatar>
                      </button>
                    ))}
                  </div>
                )}

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
                        {product.preparationTime
                          ? `${product.preparationTime} min`
                          : "N/A"}
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
                        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                          <Icons8Icon name="tag" size={14} />
                          Tags
                        </h3>
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

                    <div className="rounded-2xl border bg-background p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Unit Price
                      </p>
                      <p className="mt-1 text-3xl font-semibold">
                        {formatPrice(linePrice, product.currency)}
                      </p>
                      {(selectedCustomizationPrice > 0 || selectedAddOnPrice > 0) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Includes selected upgrades
                        </p>
                      )}
                    </div>

                    {customizationGroups.length > 0 && (
                      <div className="space-y-3">
                        {customizationGroups.map((group) => (
                          <div key={group.id} className="space-y-2">
                            <p className="text-sm font-medium">{group.name}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {group.options.map((option) => {
                                const isSelected =
                                  selectedCustomization[group.id] === option.id;

                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedCustomization((previous) => ({
                                        ...previous,
                                        [group.id]: option.id,
                                      }))
                                    }
                                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                                      isSelected
                                        ? "border-primary bg-primary/10"
                                        : "border-border/70 hover:border-primary/50"
                                    }`}
                                  >
                                    <span className="block font-medium">
                                      {option.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {option.price > 0
                                        ? `+${formatPrice(
                                            option.price,
                                            product.currency,
                                          )}`
                                        : "Included"}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {addOnOptions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Add-ons</p>
                        <div className="space-y-2">
                          {addOnOptions.map((option) => {
                            const checked = selectedAddOns.includes(option.id);

                            return (
                              <label
                                key={option.id}
                                className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                                  checked
                                    ? "border-primary bg-primary/10"
                                    : "border-border/70 hover:border-primary/50"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleAddOn(option.id)}
                                    className="h-4 w-4 rounded border-border"
                                  />
                                  {option.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  +{formatPrice(option.price, product.currency)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Quantity</p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          aria-label="Decrease quantity"
                        >
                          -
                        </Button>
                        <div className="flex h-10 min-w-16 items-center justify-center rounded-lg border px-3 text-sm font-semibold">
                          {quantity}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                          aria-label="Increase quantity"
                        >
                          +
                        </Button>
                        <div className="ml-auto text-right">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-semibold">
                            {formatPrice(totalPrice, product.currency)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="h-11 w-full" asChild>
                        <Link href="/auth/sign-up">
                          <span className="inline-flex items-center gap-2">
                            <Icons8Icon name="dollar" size={14} />
                            Order Now
                          </span>
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-11 w-full" asChild>
                        <Link href="/landing/products">Browse More Items</Link>
                      </Button>
                    </div>

                    <p className="rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      Freshly prepared after checkout. Pickup ETA is shown before
                      payment.
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </div>

            <section className="mt-12 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">You may also like</h2>
                <Button variant="outline" asChild>
                  <Link href="/landing/products">View Full Menu</Link>
                </Button>
              </div>

              {isRelatedLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-[320px] rounded-3xl" />
                  ))}
                </div>
              ) : relatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {relatedProducts.map((related) => (
                    <ProductCard
                      key={getProductKey(related._id, related.id)}
                      product={related}
                      href={`/landing/products/${
                        getProductKey(related._id, related.id)
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-sm text-muted-foreground">
                  More items are coming soon.
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {product && !isLoading && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                Qty {quantity} • {formatPrice(totalPrice, product.currency)}
              </p>
            </div>
            <Button asChild>
              <Link href="/auth/sign-up">Order</Link>
            </Button>
          </div>
        </div>
      )}

      <LandingFooter />
    </div>
  );
}
