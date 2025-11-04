"use client"

import Link from "next/link"
import type { Route } from "next"
import { usePathname } from "next/navigation"
import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from "@tabler/icons-react"

import type { DashboardViewKey } from "@/app/dashboard/DashboardViewContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type DocumentLink = {
  name: string
  url: Route
  icon: Icon
  categoryParam?: string
  exactPath?: Route
  hasActions?: boolean
  viewKey?: DashboardViewKey
}

interface NavDocumentsProps {
  items: DocumentLink[]
  activeCategory?: string | null
  activeView?: DashboardViewKey
  onSelectView?: (view: DashboardViewKey) => void
}

export function NavDocuments({ items, activeCategory, activeView, onSelectView }: NavDocumentsProps) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()

  const isActive = (item: DocumentLink) => {
    if (item.viewKey) {
      return activeView === item.viewKey
    }

    if (item.categoryParam) {
      return pathname.startsWith("/dashboard") && activeCategory === item.categoryParam
    }

    if (item.exactPath) {
      return pathname === item.exactPath
    }

    const basePath = item.url.split("?")[0]
    return pathname === basePath
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const { viewKey } = item
          return (
            <SidebarMenuItem key={item.name}>
              {viewKey && onSelectView ? (
                <SidebarMenuButton
                  type="button"
                  className={cn(
                    "transition-all duration-150",
                    isActive(item)
                      ? "bg-primary/10 text-primary shadow-inner"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  )}
                  onClick={() => onSelectView(viewKey)}
                >
                  <item.icon className="size-4" />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "transition-all duration-150",
                    isActive(item)
                      ? "bg-primary/10 text-primary shadow-inner"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <Link href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              )}
              {item.hasActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                      showOnHover
                      className="rounded-sm data-[state=open]:bg-accent"
                    >
                      <IconDots />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-24 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem>
                      <IconFolder />
                      <span>Open</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconShare3 />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <IconTrash />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
