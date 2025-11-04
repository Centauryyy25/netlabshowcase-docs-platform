"use client"

import Link from "next/link"
import { HelpCircle, MessageCircle, Mail, Sparkles, Phone, Lock } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SignInPrompt } from "@/components/auth/SignInPrompt"
import { useSession } from "@/lib/auth-client"

const faqs = [
  {
    question: "How do I upload topology files and supporting configs?",
    answer:
      "Go to the Upload Lab page and follow the three-step wizard. You can attach Packet Tracer files, configuration archives, and topology screenshots. After uploading, the lab will appear under My Labs for additional edits.",
  },
  {
    question: "Can I keep labs private or in draft state?",
    answer:
      "Yes, set the status to draft during upload. Draft labs remain hidden from the public dashboard until you are ready to publish.",
  },
  {
    question: "What platforms are supported?",
    answer:
      "NetLabShowcase supports Cisco Packet Tracer, EVE-NG, GNS3, and generic diagrams. You can also attach markdown runbooks for multi-vendor walkthroughs.",
  },
  {
    question: "How do I collaborate with peers on a lab?",
    answer:
      "Share the lab link with collaborators. Role-based editing is coming soon so teammates can contribute directly.",
  },
]

const channels = [
  {
    label: "Email support",
    description: "Detailed troubleshooting and follow ups in under 24 hours.",
    href: "mailto:hr@company.com?subject=NetLabShowcase%20Support%20Request",
    icon: Mail,
  },
  {
    label: "Discord",
    description: "Meet mentors and moderators in the #support channel.",
    href: "https://discord.gg/netlabshowcase",
    icon: MessageCircle,
  },
  {
    label: "Call back",
    description: "Schedule a 15 min session for deployment blockers.",
    href: "tel:+11234567890",
    icon: Phone,
  },
]

export default function HelpPage() {
  const { data: session, isPending } = useSession()
  const isAuthenticated = Boolean(session?.user)

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020618] text-white">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020618] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Lock className="size-4" />
            You need to sign in to access the Help Center.
          </div>
          <SignInPrompt
            title="Sign in to access support"
            description="Join the community to view FAQs, contact channels, and premium support resources."
            redirectTo="/help"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020618] text-white">
      <div className="container mx-auto space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
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

        {/* Hero */}
        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-sky-500/10 to-primary/10 p-6 text-white shadow-[0_25px_80px_-25px_rgba(56,189,248,0.6)] sm:rounded-3xl sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                <Sparkles className="mr-2 size-3.5" />
                NetLab Support Hub
              </Badge>
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold sm:text-3xl lg:text-4xl">
                <HelpCircle className="size-6 sm:size-8 lg:size-9 text-primary-foreground" />
                <span className="break-words">We are here to help</span>
              </h1>
              <p className="max-w-3xl text-[15px] leading-relaxed text-white/80 sm:text-base md:text-[17px]">
                Explore answers to frequent questions, learn troubleshooting tips, and reach moderators without leaving your study flow. Support is tailored for builders working late nights on complex topologies.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-11 w-full rounded-full bg-white/90 text-[#020618] hover:bg-white sm:h-12 sm:w-auto"
              >
                <Link href="/ai-chat">Launch AI Assistant</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="h-11 w-full rounded-full border border-white/30 bg-transparent text-white hover:bg-white/10 sm:h-12 sm:w-auto"
              >
                <Link href="/resources">Explore docs</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold sm:text-2xl">Frequently asked</h2>
          <p className="text-sm text-white/70 sm:text-base">
            Responding to the most common lab, upload, and collaboration questions from the community.
          </p>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left text-base font-medium text-white sm:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-white/80 sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Channels */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold sm:text-2xl">Quick channels</h2>
          <p className="text-sm text-white/70 sm:text-base">
            Choose how you want to reach us. Every channel routes into the same support board.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((ch, i) => (
              <Card
                key={i}
                className="border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                    <ch.icon className="size-5 text-sky-400" />
                    {ch.label}
                  </CardTitle>
                  <CardDescription className="text-white/70">{ch.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-2xl bg-gradient-to-tr from-[#2e1f66]/60 to-[#5a189a]/70 p-6 sm:p-8 lg:p-10">
          <div className="space-y-4 sm:space-y-5">
            <h2 className="text-lg font-semibold sm:text-2xl">Need live guidance?</h2>
            <p className="text-sm text-white/80 sm:text-base">
              Book a slot with a senior engineer for complex lab migrations or exam prep.
              <br />
              Sessions include topology walkthroughs, troubleshooting playbooks, and architecture reviews.
            </p>
            <Button
              asChild
              size="lg"
              className="h-11 w-full rounded-full bg-white text-[#020618] hover:bg-white/90 sm:w-auto"
            >
              <Link href="/booking">View availability</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
