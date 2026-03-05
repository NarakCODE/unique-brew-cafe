"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { APP_NAME } from '@/components/application-logo'
import { usePublicConfig } from '@/hooks/use-public-config'

const contactFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

export function ContactSection() {
  const { config } = usePublicConfig()

  const supportEmail =
    typeof config["support.email"] === "string"
      ? config["support.email"]
      : "support@uniquebrew.cafe"

  const supportPhone =
    typeof config["support.phone"] === "string"
      ? config["support.phone"]
      : "+1-555-COFFEE"

  const supportHours =
    typeof config["support.hours"] === "string"
      ? config["support.hours"]
      : "Monday-Friday: 8:00 AM - 8:00 PM"

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    const subject = encodeURIComponent(`[Landing Contact] ${values.subject}`)
    const body = encodeURIComponent(
      `Name: ${values.firstName} ${values.lastName}\nEmail: ${values.email}\n\nMessage:\n${values.message}`
    )

    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`
    form.reset()
  }

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Get In Touch</Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            We&apos;d Love to Hear From You
          </h2>
          <p className="text-lg text-muted-foreground">
            Have questions about our menu, catering, or store availability?
            Reach out and our team will help.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="order-2 space-y-6 lg:order-1">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Catering Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  Planning an event? Let us provide the coffee and treats.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${supportEmail}?subject=Catering Inquiry`}>
                    Inquire About Catering
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Support Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm text-muted-foreground">{supportEmail}</p>
                <p className="mb-2 text-sm text-muted-foreground">{supportPhone}</p>
                <p className="mb-3 text-xs text-muted-foreground">{supportHours}</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${supportPhone}`}>Call Support</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Find a Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  Browse our menu and check nearby stores before you order.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/landing/products">View Menu</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Catering inquiry, feedback, store question..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us how we can help you..."
                              rows={8}
                              className="min-h-40"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
