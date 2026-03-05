"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from "@/i18n/routing"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { APP_NAME, ApplicationLogo } from '@/components/application-logo'
import { Icons8Icon, type Icons8Name } from '@/components/landing/icons8-icon'

const newsletterSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

const footerLinks = {
  menu: [
    { name: 'Coffee & Espresso', href: '#pricing' },
    { name: 'Tea & Refreshers', href: '#pricing' },
    { name: 'Bakery & Food', href: '#pricing' },
    { name: 'Seasonal Specials', href: '#pricing' },
  ],
  company: [
    { name: 'Our Story', href: '#about' },
    { name: 'Careers', href: '#' },
    { name: 'Sustainability', href: '#' },
    { name: 'News', href: '#' },
  ],
  support: [
    { name: 'Help Center', href: '#faq' },
    { name: 'Contact Us', href: '#contact' },
    { name: 'Store Locator', href: '#stores' },
    { name: 'Gift Cards', href: '#' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Accessibility', href: '#' },
    { name: 'Cookie Policy', href: '#' },
  ],
}

const socialLinks = [
  { name: 'Instagram', href: '#', icon: "instagram" },
  { name: 'Facebook', href: '#', icon: "facebook" },
  { name: 'Twitter', href: '#', icon: "twitter-x" },
  { name: 'LinkedIn', href: '#', icon: "linkedin" },
] as { name: string; href: string; icon: Icons8Name }[]

export function LandingFooter() {
  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof newsletterSchema>) {
    console.log(values)
    form.reset()
  }

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Newsletter Section */}
        <div className="mb-16">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">Join the Brew Club</h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to get 20% off your next order and stay updated on new flavors and exclusive offers.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 max-w-md mx-auto sm:flex-row">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="cursor-pointer px-8">Join Now</Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid gap-8 grid-cols-4 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="col-span-4 lg:col-span-2 max-w-2xl">
            <div className="flex items-center space-x-2 mb-4 max-lg:justify-center">
              <Link href="/landing" className="cursor-pointer">
                <ApplicationLogo
                  iconSize={32}
                  name={APP_NAME}
                  nameClassName="font-bold text-xl"
                />
              </Link>
            </div>
            <p className="text-muted-foreground mb-6 max-lg:text-center max-lg:flex max-lg:justify-center text-sm leading-relaxed">
              At {APP_NAME}, we&apos;re dedicated to brewing happiness, one cup at a time. Join our community of coffee enthusiasts and experience the perfect blend of tradition and convenience.
            </p>
            <div className="flex space-x-4 max-lg:justify-center">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="icon" asChild className="hover:text-primary transition-colors">
                  <a
                    href={social.href}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icons8Icon name={social.icon} size={20} />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className='max-md:col-span-2 lg:col-span-1'>
            <h4 className="font-semibold mb-4">Our Menu</h4>
            <ul className="space-y-3">
              {footerLinks.menu.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='max-md:col-span-2 lg:col-span-1'>
            <h4 className="font-semibold mb-4">Experience</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='max-md:col-span-2 lg:col-span-1'>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='max-md:col-span-2 lg:col-span-1'>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-muted-foreground text-xs">
            <div className="flex items-center gap-1.5">
              <span>Brewed with</span>
              <Icons8Icon name="coffee" size={14} />
              <span>by</span>
              <span className="font-semibold text-foreground">
                {APP_NAME}
              </span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
