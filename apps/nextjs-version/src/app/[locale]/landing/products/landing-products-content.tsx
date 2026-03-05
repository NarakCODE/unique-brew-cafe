"use client";

import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "../components/navbar";
import { LandingFooter } from "../components/footer";
import { ProductCard } from "./components/product-card";
import { ProductGridSkeleton } from "./components/product-grid-skeleton";
import { Icons8Icon } from "./components/icons8-icon";
import { usePublicProducts } from "@/hooks/use-public-products";
import { ProductFilters } from "@/types/product";

export function LandingProductsContent() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const filters: ProductFilters = {
    page,
    limit: 12,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { products, pagination, isLoading, isError } =
    usePublicProducts(filters);

  const featuredCount = products.filter((product) => product.isFeatured).length;
  const bestSellerCount = products.filter(
    (product) => product.isBestSelling,
  ).length;
  const pageRangeLabel = pagination
    ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
        pagination.page * pagination.limit,
        pagination.total,
      )}`
    : "0-0";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      <section className="relative overflow-hidden border-b bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.22),transparent_60%)]">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,hsl(var(--primary)/0.06)_38%,transparent_70%)]" />
        <div className="absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/80 px-4 py-1.5 text-xs tracking-[0.18em] text-primary shadow-sm backdrop-blur-sm">
                <Icons8Icon name="sparkles" size={14} />
                DAILY BREW COLLECTION
              </span>

              <div className="space-y-3">
                <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl [font-family:Georgia,ui-serif,serif]">
                  Crafted Menu for
                  <span className="block text-primary">Coffee Hours & Beyond</span>
                </h1>
                <p className="max-w-2xl text-pretty text-muted-foreground md:text-lg">
                  Browse signature coffees, bakery picks, and all-day bites.
                  Quick search, clear categories, and product details are built in
                  so ordering feels effortless.
                </p>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-background/90 p-3 shadow-lg shadow-primary/10 backdrop-blur">
                <label htmlFor="product-search" className="sr-only">
                  Search products
                </label>
                <div className="relative">
                  <Icons8Icon
                    name="search"
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 opacity-70"
                  />
                  <Input
                    id="product-search"
                    type="search"
                    placeholder="Search drinks, pastries, categories..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-12 border-0 bg-transparent pl-11 pr-10 text-base shadow-none focus-visible:ring-0"
                    aria-label="Search products"
                  />
                  {search && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      <Icons8Icon name="close" size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <aside className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border bg-card/95 p-4 shadow-sm">
                <p className="mb-2 text-xs tracking-[0.16em] text-muted-foreground">
                  ON THIS PAGE
                </p>
                <p className="text-3xl font-semibold [font-family:Georgia,ui-serif,serif]">
                  {isLoading ? "..." : pagination?.total ?? products.length}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icons8Icon name="coffee" size={14} className="opacity-80" />
                  total menu items
                </p>
              </div>

              <div className="rounded-2xl border bg-card/95 p-4 shadow-sm">
                <p className="text-xs tracking-[0.16em] text-muted-foreground">
                  HIGHLIGHTS
                </p>
                <p className="mt-2 text-xl font-semibold">{featuredCount}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icons8Icon name="fire" size={14} className="opacity-80" />
                  featured picks
                </p>
              </div>

              <div className="rounded-2xl border bg-card/95 p-4 shadow-sm">
                <p className="text-xs tracking-[0.16em] text-muted-foreground">
                  TRENDING NOW
                </p>
                <p className="mt-2 text-xl font-semibold">{bestSellerCount}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icons8Icon name="clock" size={14} className="opacity-80" />
                  best sellers
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <main className="container mx-auto flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {!isLoading && pagination && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="rounded-full border bg-muted/40 px-3 py-1 text-sm text-muted-foreground">
              {pagination.total === 0
                ? "No products found"
                : `Showing ${pageRangeLabel} of ${pagination.total} items`}
            </p>

            {debouncedSearch && (
              <Button
                variant="ghost"
                className="h-8 rounded-full px-3 text-sm"
                onClick={() => setSearch("")}
              >
                Clear filter: {debouncedSearch}
              </Button>
            )}
          </div>
        )}

        {isLoading && <ProductGridSkeleton count={8} />}

        {isError && !isLoading && (
          <div className="rounded-3xl border bg-card p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Icons8Icon name="coffee" size={24} />
            </div>
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We could not load the menu right now. Please refresh and try
              again.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product._id || product.id}
                className="transition-transform duration-300"
              >
                <ProductCard
                  product={product}
                  href={`/landing/products/${product._id || product.id}`}
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="rounded-3xl border border-dashed bg-muted/20 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border bg-background">
              <Icons8Icon name="search" size={22} className="opacity-70" />
            </div>
            <h2 className="text-xl font-semibold">No items match</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {debouncedSearch
                ? `No results for "${debouncedSearch}". Try another keyword.`
                : "No products are available right now."}
            </p>
            {debouncedSearch && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearch("")}
              >
                Reset Search
              </Button>
            )}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <nav
            className="mt-10 flex items-center justify-center gap-2"
            aria-label="Product pagination"
          >
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="gap-1"
              aria-label="Previous page"
            >
              <Icons8Icon name="chevron-left" size={16} />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                let pageNum: number;
                const totalPages = pagination.pages;
                const currentPage = pagination.page;

                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="h-9 w-9 rounded-full p-0"
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() =>
                setPage((prev) => Math.min(pagination.pages, prev + 1))
              }
              className="gap-1"
              aria-label="Next page"
            >
              Next
              <Icons8Icon name="chevron-right" size={16} />
            </Button>
          </nav>
        )}
      </main>

      <section className="border-y bg-[linear-gradient(180deg,hsl(var(--muted)/0.35),transparent)]">
        <div className="container mx-auto px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-sm tracking-[0.12em] text-muted-foreground">
            LOOKING FOR OUR STORY?
          </p>
          <Button variant="outline" asChild>
            <Link href="/landing">Back to Home</Link>
          </Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
