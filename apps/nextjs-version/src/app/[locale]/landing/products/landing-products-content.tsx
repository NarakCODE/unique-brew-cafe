"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LandingNavbar } from "../components/navbar";
import { LandingFooter } from "../components/footer";
import { ProductCard } from "./components/product-card";
import { ProductGridSkeleton } from "./components/product-grid-skeleton";
import { Icons8Icon } from "./components/icons8-icon";
import { usePublicProducts } from "@/hooks/use-public-products";
import { usePublicCategories } from "@/hooks/use-public-categories";
import { ProductFilters } from "@/types/product";
import {
  parseLandingProductsQuery,
  type LandingProductSort,
  writeLandingProductsQuery,
  type LandingProductsQueryUpdate,
} from "@/lib/query-schemas";

const SORT_OPTIONS = [
  {
    value: "recommended",
    label: "Recommended",
    sortBy: "displayOrder",
    sortOrder: "asc" as const,
  },
  {
    value: "newest",
    label: "Newest",
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
    sortBy: "basePrice",
    sortOrder: "asc" as const,
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
    sortBy: "basePrice",
    sortOrder: "desc" as const,
  },
  {
    value: "name-asc",
    label: "Name: A-Z",
    sortBy: "name",
    sortOrder: "asc" as const,
  },
];

function isLandingProductSort(value: string): value is LandingProductSort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function getSortValue(value: LandingProductSort) {
  return SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0];
}

export function LandingProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const parsedQuery = parseLandingProductsQuery(searchParams);
  const qParam = parsedQuery.q;
  const categoryParam = parsedQuery.category;
  const pageParam = parsedQuery.page;
  const sortConfig = getSortValue(parsedQuery.sort);
  const selectedSort = sortConfig.value;
  const selectedCategory = categoryParam || "all";

  const [searchInput, setSearchInput] = React.useState(qParam);

  React.useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  const updateParams = React.useCallback(
    (updates: LandingProductsQueryUpdate) => {
      const query = writeLandingProductsQuery(searchParams, updates);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextValue = searchInput.trim();
      if (nextValue === qParam) return;

      updateParams({
        q: nextValue || null,
        page: 1,
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [qParam, searchInput, updateParams]);

  const filters: ProductFilters = {
    page: pageParam,
    limit: 12,
    ...(qParam ? { search: qParam } : {}),
    ...(selectedCategory !== "all" ? { categoryId: selectedCategory } : {}),
    ...(sortConfig.sortBy
      ? { sortBy: sortConfig.sortBy, sortOrder: sortConfig.sortOrder }
      : {}),
  };

  const {
    products,
    pagination,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = usePublicProducts(filters);
  const {
    categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = usePublicCategories();

  const featuredCount = products.filter((product) => product.isFeatured).length;
  const bestSellerCount = products.filter((product) => product.isBestSelling).length;

  const pageRangeLabel = pagination
    ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
        pagination.page * pagination.limit,
        pagination.total,
      )}`
    : "0-0";

  const hasActiveFilters = Boolean(qParam) || selectedCategory !== "all";
  const isLoading = isProductsLoading;
  const isError = isProductsError;

  const resetAllFilters = () => {
    setSearchInput("");
    updateParams({
      q: null,
      category: null,
      sort: null,
      page: null,
    });
  };

  const setPage = (page: number) => {
    updateParams({
      page: page <= 1 ? null : page,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      <section className="relative overflow-hidden border-b bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.22),transparent_60%)]">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,hsl(var(--primary)/0.06)_38%,transparent_70%)]" />
        <div className="absolute left-1/2 top-0 h-90 w-90 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/80 px-4 py-1.5 text-xs tracking-[0.18em] text-primary shadow-sm backdrop-blur-sm">
                <Icons8Icon name="sparkles" size={14} />
                DAILY BREW COLLECTION
              </span>

              <div className="space-y-3">
                <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl font-[Georgia,ui-serif,serif]">
                  Crafted Menu for
                  <span className="block text-primary">Coffee Hours & Beyond</span>
                </h1>
                <p className="max-w-2xl text-pretty text-muted-foreground md:text-lg">
                  Browse signature coffees, bakery picks, and all-day bites.
                  Search, sort, and filter with shareable links for faster ordering.
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
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="h-12 border-0 bg-transparent pl-11 pr-10 text-base shadow-none focus-visible:ring-0"
                    aria-label="Search products"
                  />
                  {searchInput && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
                      onClick={() => setSearchInput("")}
                      aria-label="Clear search"
                    >
                      <Icons8Icon name="close" size={16} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <Select
                  value={selectedSort}
                  onValueChange={(value) =>
                    updateParams({
                      sort:
                        value === "recommended" || !isLandingProductSort(value)
                          ? null
                          : value,
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger className="h-11 w-full md:max-w-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    className="h-11 md:w-auto"
                    onClick={resetAllFilters}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>

            <aside className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border bg-card/95 p-4 shadow-sm">
                <p className="mb-2 text-xs tracking-[0.16em] text-muted-foreground">
                  RESULTS
                </p>
                <p className="text-3xl font-semibold font-[Georgia,ui-serif,serif]">
                  {isLoading ? "..." : pagination?.total ?? products.length}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icons8Icon name="coffee" size={14} className="opacity-80" />
                  products matched
                </p>
              </div>

              <div className="rounded-2xl border bg-card/95 p-4 shadow-sm">
                <p className="text-xs tracking-[0.16em] text-muted-foreground">
                  FEATURED
                </p>
                <p className="mt-2 text-xl font-semibold">{featuredCount}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icons8Icon name="fire" size={14} className="opacity-80" />
                  highlighted picks
                </p>
              </div>

              <div className="rounded-2xl border bg-card/95 p-4 shadow-sm">
                <p className="text-xs tracking-[0.16em] text-muted-foreground">
                  BEST SELLERS
                </p>
                <p className="mt-2 text-xl font-semibold">{bestSellerCount}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icons8Icon name="clock" size={14} className="opacity-80" />
                  trending items
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <main className="container mx-auto flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => updateParams({ category: null, page: 1 })}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() =>
                  updateParams({
                    category: category.id,
                    page: 1,
                  })
                }
              >
                {category.name}
              </Button>
            ))}
            {isCategoriesLoading && (
              <span className="px-2 py-1 text-xs text-muted-foreground">
                Loading categories...
              </span>
            )}
            {isCategoriesError && !isCategoriesLoading && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-3 text-xs"
                onClick={() => refetchCategories()}
              >
                Retry categories
              </Button>
            )}
          </div>

          {!isLoading && pagination && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="rounded-full border bg-muted/40 px-3 py-1 text-sm text-muted-foreground">
                {pagination.total === 0
                  ? "No products found"
                  : `Showing ${pageRangeLabel} of ${pagination.total} items`}
              </p>

              {qParam && (
                <Button
                  variant="ghost"
                  className="h-8 rounded-full px-3 text-sm"
                  onClick={() => updateParams({ q: null, page: 1 })}
                >
                  Clear search: {qParam}
                </Button>
              )}
            </div>
          )}
        </div>

        {isLoading && <ProductGridSkeleton count={8} />}

        {isError && !isLoading && (
          <div className="rounded-3xl border bg-card p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Icons8Icon name="coffee" size={24} />
            </div>
            <h2 className="text-lg font-semibold">Could not load products</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              There was a problem loading your current filters. Try again or
              clear filters.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" onClick={() => refetchProducts()}>
                Retry Products
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={resetAllFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
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
            <h2 className="text-xl font-semibold">No products matched</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Try a different search, category, or sort option.
            </p>
            <div className="mt-4">
              <Button variant="outline" onClick={resetAllFilters}>
                Reset Filters
              </Button>
            </div>
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
              onClick={() => setPage(Math.max(1, pagination.page - 1))}
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
              onClick={() => setPage(Math.min(pagination.pages, pagination.page + 1))}
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
