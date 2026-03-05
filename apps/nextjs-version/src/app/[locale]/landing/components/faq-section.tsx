"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge'
import { APP_NAME } from '@/components/application-logo'
import { usePublicFaqs } from '@/hooks/use-public-faqs'

const fallbackFaqs = [
  {
    question: "When are your stores open?",
    answer: "Most of our stores are open daily from 6:30 AM to 8:00 PM. Hours may vary by location.",
  },
  {
    question: "How can I order ahead?",
    answer: "Use our website or app to pick items, select a pickup time, and place your order securely.",
  },
  {
    question: "Do you offer milk alternatives?",
    answer: "Yes. Oat, almond, soy, and coconut milk are available for most handcrafted beverages.",
  },
]

export function FaqSection() {
  const { faqs, isLoading } = usePublicFaqs()

  const displayFaqs = (faqs.length > 0 ? faqs : fallbackFaqs).slice(0, 8)

  return (
    <section id="faq" className="bg-background py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <Badge variant="outline" className="mb-4">Common Questions</Badge>
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Know
          </h2>
          <p className="text-lg text-muted-foreground">
            Can&apos;t find the answer you&apos;re looking for? Reach out to our team at any {APP_NAME} location.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {isLoading ? (
            <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
              Loading FAQs...
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {displayFaqs.map((faq, index) => (
                <AccordionItem
                  key={`${faq.question}-${index}`}
                  value={`item-${index}`}
                  className="border-border"
                >
                  <AccordionTrigger className="cursor-pointer py-6 text-left text-base font-semibold transition-colors hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </section>
  )
}
