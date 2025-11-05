"use client"

import Link from "next/link"
import type { Route } from "next"
import { usePathname } from "next/navigation"
import { IconCirclePlusFilled, IconUpload, type Icon } from "@tabler/icons-react"

import type { DashboardViewKey } from "@/app/dashboard/DashboardViewContext"
import { useModalManager } from "@/context/ModalManagerContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: Route
  icon?: Icon
  matchStrict?: boolean
  viewKey?: DashboardViewKey
}

interface NavMainProps {
  items: NavItem[]
  activeView?: DashboardViewKey
  onSelectView?: (view: DashboardViewKey) => void
}

export function NavMain({ items, activeView, onSelectView }: NavMainProps) {
  const pathname = usePathname()
  const { openQuickUpload } = useModalManager()

  const isActive = (item: NavItem) => {
    if (item.viewKey) {
      return activeView === item.viewKey
    }

    if (item.matchStrict) {
      return pathname === item.url
    }

    return pathname === item.url || pathname.startsWith(`${item.url}/`)
  }

  const itemClass = (item: NavItem) =>
    cn(
      "transition-all duration-150",
      isActive(item)
        ? "bg-primary/10 text-primary shadow-inner"
        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
    )

  const renderItemContent = (item: NavItem) => (
    <>
      {item.icon && <item.icon className="size-4" />}
      <span>{item.title}</span>
    </>
  )

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              type="button"
              onClick={openQuickUpload}
              className="min-w-8 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground transition-all duration-150"
            >
              <IconCirclePlusFilled className="size-4" />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              type="button"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
              onClick={openQuickUpload}
            >
              <IconUpload className="size-4" />
              <span className="sr-only">Open quick upload modal</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const { viewKey } = item
            return (
              <SidebarMenuItem key={item.title}>
                {viewKey && onSelectView ? (
                  <SidebarMenuButton
                    tooltip={item.title}
                    type="button"
                    className={itemClass(item)}
                    onClick={() => onSelectView(viewKey)}
                  >
                    {renderItemContent(item)}
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton tooltip={item.title} asChild className={itemClass(item)}>
                    <Link href={item.url}>{renderItemContent(item)}</Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
