"use client"

import {
  Coffee,
  Heart,
  Leaf,
  Store,
  MapPin,
  Utensils,
  Zap,
  Star,
  Gift,
  Smartphone,
  Info,
  HelpCircle
} from 'lucide-react'

const menuSections = [
  {
    title: 'Our Menu',
    items: [
      {
        title: 'Espresso Bar',
        description: 'Handcrafted lattes, cappuccinos & more',
        icon: Coffee,
        href: '#pricing'
      },
      {
        title: 'Tea & Refreshers',
        description: 'Premium teas and fruit-infused drinks',
        icon: Zap,
        href: '#pricing'
      },
      {
        title: 'Bakery & Food',
        description: 'Fresh pastries and delicious bites',
        icon: Utensils,
        href: '#pricing'
      },
      {
        title: 'Seasonal Specials',
        description: 'Limited-time flavors you will love',
        icon: Star,
        href: '#pricing'
      }
    ]
  },
  {
    title: 'Experience',
    items: [
      {
        title: 'Our Story',
        description: 'Brewing excellence since 2024',
        icon: Info,
        href: '#about'
      },
      {
        title: 'Sustainability',
        description: 'Our commitment to ethical coffee',
        icon: Leaf,
        href: '#'
      },
      {
        title: 'Brew Club Rewards',
        description: 'Earn points on every single sip',
        icon: Gift,
        href: '#'
      },
      {
        title: 'Mobile App',
        description: 'Order ahead and skip the line',
        icon: Smartphone,
        href: '#'
      }
    ]
  },
  {
    title: 'Support',
    items: [
      {
        title: 'Store Locator',
        description: 'Find a Unique Brew Cafe near you',
        icon: MapPin,
        href: '#'
      },
      {
        title: 'Help & FAQs',
        description: 'Answers to your common questions',
        icon: HelpCircle,
        href: '#faq'
      },
      {
        title: 'Contact Us',
        description: 'Get in touch with our team',
        icon: Store,
        href: '#contact'
      },
      {
        title: 'Join Our Team',
        description: 'Careers at Unique Brew Cafe',
        icon: Heart,
        href: '#'
      }
    ]
  }
]

export function MegaMenu() {
  return (
    <div className="w-[700px] max-w-[95vw] p-4 sm:p-6 lg:p-8 bg-background">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-4 lg:space-y-6">
            {/* Section Header */}
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {section.title}
            </h3>

            {/* Section Links */}
            <div className="space-y-3 lg:space-y-4">
              {section.items.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group block space-y-1 lg:space-y-2 hover:bg-accent rounded-md p-2 lg:p-3 -mx-2 lg:-mx-3 transition-colors my-0"
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed ml-6 lg:ml-7">
                    {item.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
