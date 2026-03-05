"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DotPattern } from '@/components/dot-pattern'
import { APP_NAME } from '@/components/application-logo'
import { Icons8Icon } from '@/components/landing/icons8-icon'
import { usePublicSearch, useSearchSuggestions } from '@/hooks/use-public-search'

export function HeroSection() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const searchFilters = useMemo(() => {
    if (!debouncedQuery) return undefined

    return {
      q: debouncedQuery,
      type: 'all' as const,
      limit: 5,
    }
  }, [debouncedQuery])

  const { results, isLoading: searching } = usePublicSearch(searchFilters)
  const { suggestions } = useSearchSuggestions(query.trim(), 6)

  const showSearchPanel = isFocused && query.trim().length > 0

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pb-16 pt-16 sm:pt-20">
      <div className="absolute inset-0">
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <Badge variant="outline" className="border-primary/50 px-4 py-2 text-primary">
              <Icons8Icon name="coffee" size={12} className="mr-2" />
              New Store Opening in Downtown!
              <Icons8Icon name="right" size={12} className="ml-2" />
            </Badge>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Sip, Relax, and
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}Enjoy the Perfect{" "}
            </span>
            Brew Today
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Welcome to {APP_NAME}, where every bean tells a story. From artisanal espresso to fresh pastries,
            we bring you the finest coffee experience. Order ahead and skip the line.
          </p>

          <div className="relative mx-auto mb-10 max-w-2xl text-left">
            <div className="relative">
              <Icons8Icon
                name="search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsFocused(false), 150)
                }}
                placeholder="Search drinks, pastries, and stores..."
                className="h-12 rounded-xl bg-background pl-10 pr-3"
                aria-label="Search products and stores"
              />
            </div>

            {showSearchPanel && (
              <Card className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-[320px] overflow-y-auto border bg-card p-3 shadow-xl">
                {suggestions.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Suggestions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => setQuery(suggestion)}
                          className="rounded-full border px-2 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searching ? (
                  <p className="text-sm text-muted-foreground">Searching...</p>
                ) : (
                  <div className="space-y-3">
                    {results?.products && results.products.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Products
                        </p>
                        <div className="space-y-1">
                          {results.products.slice(0, 3).map((product) => (
                            <Link
                              key={product.id}
                              href={`/landing/products/${product.id}`}
                              className="block rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                            >
                              {product.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {results?.stores && results.stores.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Stores
                        </p>
                        <div className="space-y-1">
                          {results.stores.slice(0, 3).map((store) => (
                            <a
                              key={store.id}
                              href="#stores"
                              className="block rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                            >
                              {store.name} ({store.city})
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {results && results.totalResults === 0 && (
                      <p className="text-sm text-muted-foreground">No results found.</p>
                    )}

                    <div className="pt-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/landing/products?search=${encodeURIComponent(query.trim())}`}>
                          Browse full results
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="cursor-pointer text-base" asChild>
              <Link href="/auth/sign-up">
                Order Online Now
                <Icons8Icon name="shopping-cart" size={16} className="ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="cursor-pointer text-base" asChild>
              <Link href="#stores">
                <Icons8Icon name="map-pin" size={16} className="mr-2" />
                Find a Store
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-6xl">
          <div className="group relative">
            <div className="absolute left-1/2 top-2 h-24 w-[90%] -translate-x-1/2 transform rounded-full bg-primary/30 blur-3xl lg:-top-8 lg:h-80"></div>

            <div className="relative overflow-hidden rounded-xl border bg-card shadow-2xl">
              <Image
                src="/dashboard-light.png"
                alt="Unique Brew Cafe Ordering App - Light Mode"
                width={1200}
                height={800}
                className="block w-full rounded-xl object-cover dark:hidden"
                priority
              />

              <Image
                src="/dashboard-dark.png"
                alt="Unique Brew Cafe Ordering App - Dark Mode"
                width={1200}
                height={800}
                className="hidden w-full rounded-xl object-cover dark:block"
                priority
              />

              <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-b from-background/0 via-background/70 to-background md:h-40 lg:h-48"></div>

              <div className="absolute right-10 top-10 hidden animate-bounce-slow lg:block">
                <Card className="border-primary/20 bg-background/80 p-3 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/20 p-2 text-primary">
                      <Icons8Icon name="coffee" size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Most Popular</p>
                      <p className="font-bold">Iced Caramel Latte</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
