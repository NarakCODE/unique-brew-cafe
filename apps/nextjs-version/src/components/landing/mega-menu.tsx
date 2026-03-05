"use client"

import { Icons8Icon, type Icons8Name } from "@/components/landing/icons8-icon";

interface MenuItem {
  title: string;
  description: string;
  icon: Icons8Name;
  href: string;
}

const menuSections = [
  {
    title: 'Our Menu',
    items: [
      {
        title: 'Espresso Bar',
        description: 'Handcrafted lattes, cappuccinos & more',
        icon: "coffee",
        href: '#pricing'
      },
      {
        title: 'Tea & Refreshers',
        description: 'Premium teas and fruit-infused drinks',
        icon: "lightning",
        href: '#pricing'
      },
      {
        title: 'Bakery & Food',
        description: 'Fresh pastries and delicious bites',
        icon: "food",
        href: '#pricing'
      },
      {
        title: 'Seasonal Specials',
        description: 'Limited-time flavors you will love',
        icon: "star",
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
        icon: "info",
        href: '#about'
      },
      {
        title: 'Sustainability',
        description: 'Our commitment to ethical coffee',
        icon: "leaf",
        href: '#'
      },
      {
        title: 'Brew Club Rewards',
        description: 'Earn points on every single sip',
        icon: "gift",
        href: '#'
      },
      {
        title: 'Mobile App',
        description: 'Order ahead and skip the line',
        icon: "smartphone",
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
        icon: "map-pin",
        href: '#stores'
      },
      {
        title: 'Help & FAQs',
        description: 'Answers to your common questions',
        icon: "help",
        href: '#faq'
      },
      {
        title: 'Contact Us',
        description: 'Get in touch with our team',
        icon: "store",
        href: '#contact'
      },
      {
        title: 'Join Our Team',
        description: 'Careers at Unique Brew Cafe',
        icon: "heart",
        href: '#'
      }
    ]
  }
] as { title: string; items: MenuItem[] }[];

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
                    <Icons8Icon
                      name={item.icon}
                      size={16}
                      className="opacity-75 group-hover:opacity-100 transition-opacity"
                    />
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
