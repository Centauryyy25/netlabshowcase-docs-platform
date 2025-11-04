"use client"

import * as React from "react"
import Link from "next/link"
import type { Route } from "next"
import Image from "next/image"
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

import type { DashboardViewKey } from "@/app/dashboard/DashboardViewContext"
import { useDashboardView } from "@/app/dashboard/DashboardViewContext"
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
  viewKey?: DashboardViewKey
}

type DocumentNavigationItem = {
  name: string
  url: Route
  icon: Icon
  categoryParam?: string
  exactPath?: Route
  hasActions?: boolean
  viewKey?: DashboardViewKey
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
    viewKey: "home",
  },
  {
    title: "Upload Lab",
    url: "/upload",
    icon: IconUpload,
    viewKey: "upload",
  },
  {
    title: "My Labs",
    url: "/my-labs",
    icon: IconFolder,
    viewKey: "mylabs",
  },
]

const documentNavigation: DocumentNavigationItem[] = [
  {
    name: "Docs Bucket",
    url: "/resource",
    icon: IconCloud,
    categoryParam: "MPLS",
    hasActions: true,
    viewKey: "mpls",
  },
  {
    name: "Ai Asistent Lab",
    url: "/ai-chat",
    icon: IconDeviceDesktop,
    categoryParam: "Wireless",
    hasActions: true,
    viewKey: "ai",
  },
  {
    name: "All Categories",
    url: "/categories",
    icon: IconBook,
    exactPath: "/categories",
    viewKey: "categories",
  },
  {
    name: "More",
    url: "/resources",
    icon: IconListDetails,
    exactPath: "/resources",
    viewKey: "more",
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

function AppSidebarComponent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const { activeView, setActiveView } = useDashboardView()
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

  const handleSelectView = React.useCallback(
    (view: DashboardViewKey) => {
      setActiveView(view)
    },
    [setActiveView]
  )

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
          <NavMain
            items={mainNavigation}
            onQuickCreate={() => setIsQuickCreateOpen(true)}
            activeView={activeView}
            onSelectView={handleSelectView}
          />
          <NavDocuments
            items={documentNavigation}
            activeView={activeView}
            onSelectView={handleSelectView}
          />
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

const AppSidebar = React.memo(AppSidebarComponent)
AppSidebar.displayName = "AppSidebar"

export { AppSidebar }
export default AppSidebar
