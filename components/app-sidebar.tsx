"use client"

import * as React from "react"
import Link from "next/link"
import type { Route } from "next"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import {
  IconBook,
  IconCloud,
  IconDashboard,
  IconDeviceDesktop,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconSearch,
  IconSettings,
  IconUpload,
  type Icon,
} from "@tabler/icons-react"

import { QuickCreateLabModal } from "@/components/quick-create-lab-modal"
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import etherDocsLogo from "@/components/Asset/Icon-etherdocs.png"

type MainNavigationItem = {
  title: string
  url: Route
  icon: Icon
}

type DocumentNavigationItem = {
  name: string
  url: Route
  icon: Icon
  categoryParam?: string
  exactPath?: Route
  hasActions?: boolean
}

type SecondaryNavigationItem = {
  title: string
  url: Route
  icon: Icon
}

const mainNavigation: MainNavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Upload Lab",
    url: "/upload",
    icon: IconUpload,
  },
  {
    title: "My Labs",
    url: "/my-labs",
    icon: IconFolder,
  },
]

const documentNavigation: DocumentNavigationItem[] = [
  {
    name: "MPLS Labs",
    url: "/dashboard?category=MPLS",
    icon: IconCloud,
    categoryParam: "MPLS",
    hasActions: true,
  },
  {
    name: "Ai Asistent Lab",
    url: "/ai-chat",
    icon: IconDeviceDesktop,
    categoryParam: "Wireless",
    hasActions: true,
  },
  {
    name: "All Categories",
    url: "/categories",
    icon: IconBook,
    exactPath: "/categories",
  },
  {
    name: "More",
    url: "/resources",
    icon: IconListDetails,
    exactPath: "/resources",
  },
]

const secondaryNavigation: SecondaryNavigationItem[] = [
  {
    title: "Settings",
    url: "/settings",
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "/help",
    icon: IconHelp,
  },
  {
    title: "Search",
    url: "/search",
    icon: IconSearch,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isQuickCreateOpen, setIsQuickCreateOpen] = React.useState(false)

  const userData = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email,
        avatar: session.user.image || etherDocsLogo.src,
      }
    : {
        name: "Guest",
        email: "guest@example.com",
        avatar: etherDocsLogo.src,
      }

  const activeCategory = pathname.startsWith("/dashboard") ? searchParams.get("category") : null

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                <Link href="/">
                  <Image src={etherDocsLogo} alt="NetLabShowcase" width={32} height={32} className="rounded-lg" />
                  <span className="text-base font-semibold font-parkinsans">EtherDocs Platform</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={mainNavigation} onQuickCreate={() => setIsQuickCreateOpen(true)} />
          <NavDocuments items={documentNavigation} activeCategory={activeCategory} />
          <NavSecondary items={secondaryNavigation} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>
      <QuickCreateLabModal open={isQuickCreateOpen} onOpenChange={setIsQuickCreateOpen} />
    </>
  )
}
