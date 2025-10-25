"use client"

import Link from "next/link"
import type { Route } from "next"
import { usePathname } from "next/navigation"
import { IconCirclePlusFilled, IconUpload, type Icon } from "@tabler/icons-react"

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
}

interface NavMainProps {
  items: NavItem[]
  onQuickCreate: () => void
}

export function NavMain({ items, onQuickCreate }: NavMainProps) {
  const pathname = usePathname()

  const isActive = (item: NavItem) => {
    if (item.matchStrict) {
      return pathname === item.url
    }

    return pathname === item.url || pathname.startsWith(`${item.url}/`)
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              onClick={onQuickCreate}
              className="min-w-8 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground transition-all duration-150"
            >
              <IconCirclePlusFilled className="size-4" />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              asChild
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <Link href="/upload">
                <IconUpload className="size-4" />
                <span className="sr-only">Open upload page</span>
              </Link>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                className={cn(
                  "transition-all duration-150",
                  isActive(item)
                    ? "bg-primary/10 text-primary shadow-inner"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
