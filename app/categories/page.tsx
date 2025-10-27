"use client"

import Link from "next/link"
import type { Route as AppRoute } from "next"
import { Route, Network, ShieldCheck, RadioTower, Cable, Server } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type CategoryItem = {
  name: string
  description: string
  icon: typeof Route
  color: string
  url: AppRoute
  tags: readonly string[]
}
const categories: CategoryItem[] = [
  {
    name: "Routing",
    description: "Dynamic, static, and policy-based routing scenarios for enterprise networks.",
    icon: Route,
    color: "from-blue-500/20 to-blue-400/10 border-blue-500/30",
    url: "/dashboard?category=Routing",
    tags: ["OSPF", "BGP", "EIGRP"],
  },
  {
    name: "Switching",
    description: "Layer 2 to Layer 3 switching, VLAN design, redundancy, and segmentation.",
    icon: Network,
    color: "from-emerald-500/20 to-emerald-400/10 border-emerald-500/30",
    url: "/dashboard?category=Switching",
    tags: ["STP", "VXLAN", "Fabric"],
  },
  {
    name: "Security",
    description: "Firewall rules, zero-trust, VPNs, and secure edge deployments.",
    icon: ShieldCheck,
    color: "from-rose-500/20 to-rose-400/10 border-rose-500/30",
    url: "/dashboard?category=Security",
    tags: ["ACL", "VPN", "Firewall"],
  },
  {
    name: "Wireless",
    description: "Controller-based, mesh, and campus Wi-Fi designs with optimization tips.",
    icon: RadioTower,
    color: "from-violet-500/20 to-violet-400/10 border-violet-500/30",
    url: "/dashboard?category=Wireless",
    tags: ["RF Planning", "WLC", "WIDS"],
  },
  {
    name: "MPLS",
    description: "Provider edge lab scenarios covering L2/L3 VPN, TE, and QoS strategies.",
    icon: Cable,
    color: "from-orange-500/20 to-orange-400/10 border-orange-500/30",
    url: "/dashboard?category=MPLS",
    tags: ["LDP", "Traffic Engineering", "QoS"],
  },
  {
    name: "Data Center",
    description: "Modern DC fabrics, automation-ready topologies, and redundancy patterns.",
    icon: Server,
    color: "from-cyan-500/20 to-cyan-400/10 border-cyan-500/30",
    url: "/dashboard?category=Data%20Center",
    tags: ["EVPN", "Spine-Leaf", "Automation"],
  },
]

export default function CategoriesPage() {
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
            <BreadcrumbPage>Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Browse by Category</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Jump straight into the topics that match your current study plan or classroom focus.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {categories.map((category) => (
          <Card
            key={category.name}
            className={`border ${category.color} bg-gradient-to-br transition hover:shadow-lg`}
          >
            <CardHeader className="flex flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-6 sm:py-6">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <category.icon className="size-5 shrink-0" />
                  {category.name}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  {category.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-5 pt-0 sm:px-6">
              <div className="flex flex-wrap gap-2">
                {category.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-current/40 text-xs sm:text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Link
                href={category.url}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline sm:text-base"
              >
                View labs in {category.name}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
