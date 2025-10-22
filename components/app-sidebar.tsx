"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "@/lib/auth-client"
import {
  IconUpload,
  IconChartBar,
  IconDashboard,
  IconNetwork,
  IconBook,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconSchool,
  IconShield,
  IconRouter,
  IconCloud,
  IconDeviceDesktop,
} from "@tabler/icons-react"

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

const staticData = {
  navMain: [
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
      url: "/dashboard?my=true",
      icon: IconFolder,
    },
  ],
  navClouds: [
    {
      title: "Routing",
      icon: IconRouter,
      url: "/dashboard?category=Routing",
      items: [
        {
          title: "OSPF Labs",
          url: "/dashboard?category=Routing&search=OSPF",
        },
        {
          title: "EIGRP Labs",
          url: "/dashboard?category=Routing&search=EIGRP",
        },
        {
          title: "BGP Labs",
          url: "/dashboard?category=Routing&search=BGP",
        },
      ],
    },
    {
      title: "Switching",
      icon: IconNetwork,
      url: "/dashboard?category=Switching",
      items: [
        {
          title: "VLAN Labs",
          url: "/dashboard?category=Switching&search=VLAN",
        },
        {
          title: "STP Labs",
          url: "/dashboard?category=Switching&search=STP",
        },
        {
          title: "EtherChannel",
          url: "/dashboard?category=Switching&search=EtherChannel",
        },
      ],
    },
    {
      title: "Security",
      icon: IconShield,
      url: "/dashboard?category=Security",
      items: [
        {
          title: "ACL Labs",
          url: "/dashboard?category=Security&search=ACL",
        },
        {
          title: "VPN Labs",
          url: "/dashboard?category=Security&search=VPN",
        },
        {
          title: "Firewall Labs",
          url: "/dashboard?category=Security&search=Firewall",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "MPLS Labs",
      url: "/dashboard?category=MPLS",
      icon: IconCloud,
    },
    {
      name: "Wireless Labs",
      url: "/dashboard?category=Wireless",
      icon: IconDeviceDesktop,
    },
    {
      name: "All Categories",
      url: "/dashboard",
      icon: IconBook,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  
  const userData = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email,
    avatar: session.user.image || "/codeguide-logo.png",
  } : {
    name: "Guest",
    email: "guest@example.com", 
    avatar: "/codeguide-logo.png",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image src="/codeguide-logo.png" alt="CodeGuide" width={32} height={32} className="rounded-lg" />
                <span className="text-base font-semibold font-parkinsans">NetLabShowcase</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavDocuments items={staticData.documents} />
        <NavSecondary items={staticData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
