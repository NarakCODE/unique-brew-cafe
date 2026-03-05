"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { APP_NAME } from '@/components/application-logo'
import { Icons8Icon } from '@/components/landing/icons8-icon'

export function CTASection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-primary/5 dark:bg-primary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
            <Icons8Icon name="coffee" size={14} className="mr-2" />
            Special App-Only Offer
          </Badge>

          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-8">
            Ready to Savor the Perfect Cup?
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Join thousands of coffee lovers who trust {APP_NAME} for their daily brew.
            Start earning rewards today and get 20% off your first order!
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-lg px-10 h-14 cursor-pointer group shadow-lg shadow-primary/20" asChild>
              <Link href="/auth/sign-up">
                Order Online Now
                <Icons8Icon
                  name="shopping-cart"
                  size={20}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-10 h-14 cursor-pointer bg-background/50 backdrop-blur-sm" asChild>
              <Link href="#">
                <Icons8Icon name="smartphone" size={20} className="mr-2" />
                Download Our App
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Free First Drink
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Earn Rewards
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Exclusive Access
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
