"use client"

import {
  Clock,
  Zap,
  Gift,
  ArrowRight,
  MapPin,
  Coffee,
  Smartphone,
  ShieldCheck,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image3D } from '@/components/image-3d'
import { APP_NAME } from '@/components/application-logo'

const mainFeatures = [
  {
    icon: Clock,
    title: 'Order Ahead',
    description: 'Skip the line and have your coffee ready when you arrive.'
  },
  {
    icon: Gift,
    title: 'Loyalty Rewards',
    description: 'Earn points on every purchase and redeem for free drinks.'
  },
  {
    icon: Coffee,
    title: 'Handcrafted Quality',
    description: 'Every drink is prepared with care by our expert baristas.'
  },
  {
    icon: Zap,
    title: 'Instant Reorder',
    description: 'Your favorite morning brew is just one tap away.'
  }
]

const secondaryFeatures = [
  {
    icon: MapPin,
    title: 'Store Locator',
    description: 'Find the nearest cafe with real-time status and hours.'
  },
  {
    icon: Smartphone,
    title: 'Mobile Wallet',
    description: 'Secure, fast payments directly from our mobile app.'
  },
  {
    icon: Star,
    title: 'Exclusive Offers',
    description: 'Get member-only access to new seasonal flavors and deals.'
  },
  {
    icon: ShieldCheck,
    title: 'Contactless Service',
    description: 'Safe and convenient ordering for your peace of mind.'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Why Choose {APP_NAME}</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            The Ultimate Coffee Experience at Your Fingertips
          </h2>
          <p className="text-lg text-muted-foreground">
            We combine traditional brewing excellence with modern convenience to make your daily coffee ritual exceptional.
          </p>
        </div>

        {/* First Feature Section */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 mb-24">
          {/* Left Image */}
          <Image3D
            lightSrc="/feature-1-light.png"
            darkSrc="/feature-1-dark.png"
            alt="Mobile ordering experience"
            direction="left"
          />
          {/* Right Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Convenience without compromise
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Our mobile app is designed to bring you the best of {APP_NAME} wherever you are. Order ahead, customize your brew, and enjoy your time.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {mainFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer">
                <a href="/auth/sign-up" className='flex items-center'>
                  Order Now
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer">
                <a href="#about">
                  Learn Our Story
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Second Feature Section - Flipped Layout */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Left Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                More than just a cup of coffee
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                We&apos;re building a community of coffee lovers. Join our rewards program and get access to exclusive events, workshops, and seasonal previews.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer">
                <a href="/auth/sign-up" className='flex items-center'>
                  Join Rewards
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer">
                <a href="#contact">
                  Find a Store
                </a>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <Image3D
            lightSrc="/feature-2-light.png"
            darkSrc="/feature-2-dark.png"
            alt="Coffee community"
            direction="right"
            className="order-1 lg:order-2"
          />
        </div>
      </div>
    </section>
  )
}
