"use client"

import Link from "next/link"
import { HelpCircle, MessageCircle } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

const faqs = [
  {
    question: "How do I upload topology files and supporting configs?",
    answer:
      "Head to the Upload Lab page and complete the three-step wizard. You can attach Packet Tracer files, configuration archives, and topology screenshots. After uploading, the lab will appear under My Labs for additional edits.",
  },
  {
    question: "Can I keep labs private or in draft state?",
    answer:
      "Yes, set the status to draft during upload. Draft labs remain hidden from the public dashboard until you are ready to publish.",
  },
  {
    question: "What platforms are supported?",
    answer:
      "NetLabShowcase currently supports labs from Cisco Packet Tracer, EVE-NG, GNS3, and generic network diagrams. You can also attach markdown runbooks for multi-vendor walkthroughs.",
  },
  {
    question: "How do I collaborate with peers on a lab?",
    answer:
      "Share the lab link with collaborators. We are actively working on role-based collaboration so teammates can contribute directly from their accounts.",
  },
]

export default function HelpPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Help Center</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-border/50 bg-muted/10 backdrop-blur">
        <CardHeader className="space-y-3 px-4 py-4 sm:space-y-4 sm:px-6 sm:py-6">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
            <HelpCircle className="size-7 text-primary" />
            Need assistance?
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed sm:text-base">
            Find answers to common questions or reach out to the NetLabShowcase team for additional support.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 px-4 pb-5 pt-0 sm:px-6 lg:grid-cols-[2fr,1fr]">
          <div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`item-${index}`}
                  className="rounded-lg border border-border/40 px-4"
                >
                  <AccordionTrigger className="text-left text-sm font-medium sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-5">
            <h2 className="text-lg font-semibold sm:text-xl">Still stuck?</h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Our community moderators respond within 24 hours on weekdays. Choose the channel that works best for you.
            </p>
            <Button asChild className="h-11 w-full">
              <a href="mailto:hr@company.com?subject=NetLabShowcase%20Support%20Request">
                Email Support
              </a>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full">
              <a href="https://discord.gg/netlabshowcase" target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 size-4" />
                Join Discord
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
