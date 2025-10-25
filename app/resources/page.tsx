"use client"

import Link from "next/link"
import { BookOpen, ExternalLink, LayoutTemplate } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

type GuideResource = {
  title: string
  duration: string
  description: string
  link: string
}

type TemplateResource = {
  name: string
  format: string
  description: string
  link: string
}

type ExternalResource = {
  label: string
  description: string
  href: `https://${string}`
}

const guides: readonly GuideResource[] = [
  {
    title: "Designing MPLS L3VPN Services",
    duration: "20 minute read",
    description: "Step-by-step walkthrough covering PE-CE routing choices, VRF design, and verification tips.",
    link: "/documentation/mpls-l3vpn",
  },
  {
    title: "Campus Wireless Optimization",
    duration: "12 minute read",
    description: "Channel planning, roaming enhancements, and high-density best practices for 802.11ax deployments.",
    link: "/documentation/wireless-optimization",
  },
  {
    title: "Zero-Trust Network Access Blueprint",
    duration: "18 minute read",
    description: "Identity-driven segmentation patterns with practical lab validation steps.",
    link: "/documentation/ztna-blueprint",
  },
]

const templates: readonly TemplateResource[] = [
  {
    name: "Topology Kickoff Checklist",
    format: "Notion Template",
    description: "Stakeholder requirements, topology drafts, and validation milestones in one collaborative workspace.",
    link: "/documentation/templates/topology-checklist",
  },
  {
    name: "Lab Report Playbook",
    format: "Markdown",
    description: "Document assumptions, test outcomes, and remediation steps for reproducible lab reports.",
    link: "/documentation/templates/lab-report",
  },
  {
    name: "Troubleshooting Flowchart",
    format: "PDF",
    description: "Printable flowchart to triage connectivity, performance, and security issues.",
    link: "/documentation/templates/troubleshooting-flow",
  },
]

const externalLinks: readonly ExternalResource[] = [
  {
    label: "Cisco DevNet Sandbox",
    description: "Open labs for routers, switches, security, collaboration, and data center platforms.",
    href: "https://devnetsandbox.cisco.com",
  },
  {
    label: "Juniper vLabs",
    description: "On-demand labs to explore Juniper routing, automation, and security stacks.",
    href: "https://jlabs.juniper.net",
  },
  {
    label: "Meraki Reference Designs",
    description: "Validated architecture examples for SD-WAN, secure edge, and campus fabrics.",
    href: "https://meraki.cisco.com/architectures",
  },
]

export default function ResourcesPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Resource Hub</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Resource Hub</h1>
        <p className="text-muted-foreground max-w-2xl">
          Curated study guides, reusable templates, and external knowledge sources to accelerate your lab builds.
        </p>
      </div>

      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="w-full justify-start bg-muted/30 p-1">
          <TabsTrigger value="guides" className="data-[state=active]:bg-background">
            Guides
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-background">
            Templates
          </TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-background">
            External Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-4">
          {guides.map((guide) => (
            <Card key={guide.title} className="border-border/40 bg-muted/10 backdrop-blur">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                  <CardDescription>{guide.duration}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground md:max-w-xl">{guide.description}</p>
                <Link href={{ pathname: guide.link }} className="text-primary text-sm font-medium hover:underline">
                  Read guide
                </Link>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.name} className="border-border/40 bg-muted/10 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline" className="gap-1">
                    <LayoutTemplate className="size-4" />
                    {template.format}
                  </Badge>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={{ pathname: template.link }} className="text-primary text-sm font-medium hover:underline">
                  Use template
                </Link>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="links" className="grid gap-4 md:grid-cols-2">
          {externalLinks.map((resource) => (
            <Card key={resource.href} className="border-border/40 bg-muted/10 backdrop-blur">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ExternalLink className="size-4" />
                  {resource.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{resource.description}</p>
                <Link
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Visit resource
                </Link>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
