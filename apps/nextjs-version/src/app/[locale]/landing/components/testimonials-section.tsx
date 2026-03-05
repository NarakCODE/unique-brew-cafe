"use client"

import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { APP_NAME } from '@/components/application-logo'

const testimonials = [
  {
    quote: "The best espresso I've had in years. The atmosphere is so cozy and the baristas are incredibly knowledgeable. My new favorite spot!",
    author: "Sarah J.",
    role: "Coffee Enthusiast",
    avatar: "/avatars/sarah.jpg",
    rating: 5
  },
  {
    quote: "I love the online ordering feature. My coffee is always ready exactly when I arrive, which is perfect for my busy morning commute.",
    author: "Michael T.",
    role: "Regular Customer",
    avatar: "/avatars/michael.jpg",
    rating: 5
  },
  {
    quote: "Great place to work and amazing pastries. The avocado toast is a must-try! I spend most of my afternoons here with my laptop.",
    author: "Emily R.",
    role: "Freelance Designer",
    avatar: "/avatars/emily.jpg",
    rating: 5
  }
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Loved by Our Community
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our regulars have to say about their {APP_NAME} experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background border-none shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-8">
                  <Quote className="absolute -top-4 -left-4 w-8 h-8 text-primary/10 -z-0" />
                  <p className="text-foreground italic leading-relaxed relative z-10">
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-primary/10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                    <AvatarFallback>{testimonial.author.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{testimonial.author}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
