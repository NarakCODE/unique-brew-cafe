"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CardDecorator } from '@/components/ui/card-decorator'
import Link from 'next/link'
import { APP_NAME } from '@/components/application-logo'
import { Icons8Icon, type Icons8Name } from '@/components/landing/icons8-icon'

const values = [
  {
    icon: "coffee",
    title: 'Quality Beans',
    description: 'We source the finest Arabica beans from sustainable farms around the world.'
  },
  {
    icon: "leaf",
    title: 'Expert Roasting',
    description: 'Our master roasters bring out the unique flavors and aromas in every single batch.'
  },
  {
    icon: "heart",
    title: 'Artisanal Prep',
    description: 'Each cup is handcrafted with precision and passion by our highly skilled baristas.'
  },
  {
    icon: "store",
    title: 'Community First',
    description: 'We create warm, inviting spaces where people can connect, work, and share stories.'
  }
] as { icon: Icons8Name; title: string; description: string }[]

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            About {APP_NAME}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Brewing Excellence, One Cup at a Time
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            At {APP_NAME}, we believe coffee is more than just a morning routine—it&apos;s a craft.
            Founded with a passion for exceptional taste and community, we meticulously source our beans
            and perfect our techniques to ensure every visit is an experience worth savoring.
          </p>
        </div>

        {/* Modern Values Grid with Enhanced Design */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {values.map((value, index) => (
            <Card key={index} className='group shadow-xs py-2'>
              <CardContent className='p-8'>
                <div className='flex flex-col items-center text-center'>
                  <CardDecorator>
                    <Icons8Icon name={value.icon} size={24} />
                  </CardDecorator>
                  <h3 className='mt-6 font-medium text-balance'>{value.title}</h3>
                  <p className='text-muted-foreground mt-3 text-sm'>{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-muted-foreground">☕ Join our journey to the perfect brew</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="cursor-pointer" asChild>
              <Link href="/auth/sign-up">
                Start Your Coffee Order
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="cursor-pointer" asChild>
              <Link href="#contact">
                Get in Touch
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
