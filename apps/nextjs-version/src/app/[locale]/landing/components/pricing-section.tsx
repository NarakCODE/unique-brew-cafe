"use client"

import Link from "next/link"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { APP_NAME } from '@/components/application-logo'
import { usePublicCategories } from '@/hooks/use-public-categories'
import { usePublicProducts } from '@/hooks/use-public-products'

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(price ?? 0)
}

export function PricingSection() {
  const { categories, isLoading: categoriesLoading } = usePublicCategories()
  const { products, isLoading: productsLoading } = usePublicProducts({ limit: 36 })

  const isLoading = categoriesLoading || productsLoading

  const sections = categories
    .map((category) => {
      const items = products
        .filter((product) => {
          const categoryId =
            typeof product.categoryId === "object"
              ? (product.categoryId._id || product.categoryId.id)
              : product.categoryId
          const mappedCategoryId =
            typeof product.category === "object"
              ? (product.category._id || product.category.id)
              : undefined

          return categoryId === category.id || mappedCategoryId === category.id
        })
        .slice(0, 4)

      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        items,
        hasFeatured: items.some((item) => item.isFeatured),
      }
    })
    .filter((section) => section.items.length > 0)
    .slice(0, 3)

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Our Menu Highlights</Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Curated Brews & Bites
          </h2>
          <p className="text-lg text-muted-foreground">
            From our signature espresso to artisan pastries, discover the flavors that make {APP_NAME} unique.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            Loading today&apos;s featured menu...
          </div>
        )}

        {!isLoading && sections.length > 0 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {sections.map((section, index) => (
              <Card
                key={section.id}
                className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  index === 0 || section.hasFeatured
                    ? 'border-primary shadow-md lg:scale-[1.03] z-10'
                    : 'border-border'
                }`}
              >
                {(index === 0 || section.hasFeatured) && (
                  <div className="absolute right-0 top-0">
                    <div className="rounded-bl-lg bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      Popular Picks
                    </div>
                  </div>
                )}

                <CardHeader className="px-8 pb-6 pt-8">
                  <div className="mb-2 inline-flex w-fit rounded-full border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">
                    {section.name}
                  </div>
                  <h3 className="text-xl font-bold">{section.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {section.description || `Top selections from our ${section.name.toLowerCase()} menu.`}
                  </p>
                </CardHeader>

                <CardContent className="flex-1 px-8">
                  <ul className="space-y-4">
                    {section.items.map((item) => (
                      <li key={item._id || item.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.isFeatured ? 'Featured item' : 'Daily menu'}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold">
                          {formatPrice(item.basePrice, item.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-8 pt-4">
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/landing/products?categoryId=${section.id}`}>
                      Explore {section.name}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && sections.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">
            No menu highlights available right now.
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="mb-4 text-muted-foreground">Want to see our full selection?</p>
          <Button variant="link" size="lg" asChild>
            <Link href="/landing/products" className="inline-flex items-center font-semibold">
              View Full Menu
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
