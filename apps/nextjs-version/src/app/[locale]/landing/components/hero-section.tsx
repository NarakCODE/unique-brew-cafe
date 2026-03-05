"use client"

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShoppingCart, Coffee, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DotPattern } from '@/components/dot-pattern'
import { APP_NAME } from '@/components/application-logo'

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pt-16 sm:pt-20 pb-16">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Dot pattern overlay using reusable component */}
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement Badge */}
          <div className="mb-8 flex justify-center">
            <Badge variant="outline" className="px-4 py-2 border-primary/50 text-primary">
              <Coffee className="w-3 h-3 mr-2 fill-current" />
              New Store Opening in Downtown!
              <ArrowRight className="w-3 h-3 ml-2" />
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Sip, Relax, and
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}Enjoy the Perfect{" "}
            </span>
            Brew Today
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Welcome to {APP_NAME}, where every bean tells a story. From artisanal espresso to fresh pastries,
            we bring you the finest coffee experience. Order ahead and skip the line!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base cursor-pointer" asChild>
              <Link href="/auth/sign-up">
                Order Online Now
                <ShoppingCart className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base cursor-pointer" asChild>
              <Link href="#features">
                <MapPin className="mr-2 h-4 w-4" />
                Find a Store
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Image/Visual */}
        <div className="mx-auto mt-20 max-w-6xl">
          <div className="relative group">
            {/* Top background glow effect - positioned above the image */}
            <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/30 rounded-full blur-3xl"></div>

            <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
              {/* Light mode app image */}
              <Image
                src="/dashboard-light.png"
                alt="Unique Brew Cafe Ordering App - Light Mode"
                width={1200}
                height={800}
                className="w-full rounded-xl object-cover block dark:hidden"
                priority
              />

              {/* Dark mode app image */}
              <Image
                src="/dashboard-dark.png"
                alt="Unique Brew Cafe Ordering App - Dark Mode"
                width={1200}
                height={800}
                className="w-full rounded-xl object-cover hidden dark:block"
                priority
              />

              {/* Bottom fade effect - gradient overlay that fades the image to background */}
              <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 lg:h-48 bg-gradient-to-b from-background/0 via-background/70 to-background"></div>

              {/* Floating badges/stats overlay for visual interest */}
              <div className="absolute top-10 right-10 hidden lg:block animate-bounce-slow">
                <Card className="bg-background/80 backdrop-blur-md p-3 border-primary/20 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-full text-primary">
                      <Coffee className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Most Popular</p>
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
