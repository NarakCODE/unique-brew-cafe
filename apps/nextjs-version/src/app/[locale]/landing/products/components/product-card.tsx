"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Product } from "@/types/product";
import { Icons8Icon } from "./icons8-icon";

interface ProductCardProps {
  product: Product;
  href: string;
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

export function ProductCard({ product, href }: ProductCardProps) {
  const imageUrl = getFirstImageUrl(product.images);
  const category = product.category || product.categoryId;

  return (
    <Link href={href} aria-label={`View details for ${product.name}`}>
      <Card className="group h-full cursor-pointer overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <Avatar className="h-full w-full rounded-none">
          <AvatarImage
            src={imageUrl}
            alt={product.name}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <AvatarFallback className="rounded-none bg-linear-to-br from-primary/15 to-primary/5 text-4xl text-primary">
            {product.name?.charAt(0)?.toUpperCase() || "P"}
          </AvatarFallback>
        </Avatar>

        <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.isFeatured && (
            <Badge className="gap-1 border-0 bg-amber-500/95 text-white">
              <Icons8Icon name="sparkles" size={12} className="invert" />
              Featured
            </Badge>
          )}
          {product.isBestSelling && (
            <Badge className="gap-1 border-0 bg-sky-600/95 text-white">
              <Icons8Icon name="line-chart" size={12} className="invert" />
              Popular
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-neutral-900 backdrop-blur">
          {formatPrice(product.basePrice, product.currency)}
        </div>
      </div>

      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold group-hover:text-primary">
              {product.name}
            </h3>
            {category && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <span>{category.icon || "☕"}</span>
                <span className="truncate">{category.name}</span>
              </p>
            )}
          </div>

          <Icons8Icon
            name="external-link"
            size={16}
            className="opacity-70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>

        {product.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
          {product.preparationTime ? (
            <span className="inline-flex items-center gap-1">
              <Icons8Icon name="clock" size={14} className="opacity-70" />
              {product.preparationTime} min
            </span>
          ) : (
            <span />
          )}

          {product.rating ? (
            <span className="inline-flex items-center gap-1 font-medium text-amber-600">
              <Icons8Icon name="star" size={12} className="opacity-90" />
              {product.rating.toFixed(1)}
            </span>
          ) : product.totalReviews > 0 ? (
            <span>{product.totalReviews} reviews</span>
          ) : null}
        </div>
      </CardContent>
      </Card>
    </Link>
  );
}
