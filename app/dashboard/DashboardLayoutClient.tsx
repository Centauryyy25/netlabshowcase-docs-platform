"use client"

import type { CSSProperties, ReactNode } from "react"
import { memo } from "react"

import DashboardViewRenderer from "@/components/dashboard/DashboardViewRenderer"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { QuickUploadModal } from "@/components/labs/QuickUploadModal"
import { GlobalHotkeys } from "@/components/keyboard/GlobalHotkeys"
import AppSidebar from "@/components/app-sidebar"

import { DashboardViewProvider } from "./DashboardViewContext"

type DashboardLayoutClientProps = {
  children: ReactNode
  defaultOpen: boolean
}

function DashboardLayoutClientComponent({
  children,
  defaultOpen,
}: DashboardLayoutClientProps) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as CSSProperties
      }
    >
      <DashboardViewProvider syncWithURL={false}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <DashboardViewRenderer />
            {children}
          </div>
        </SidebarInset>
      </DashboardViewProvider>
      <QuickUploadModal />
      <GlobalHotkeys />
    </SidebarProvider>
  )
}

export const DashboardLayoutClient = memo(DashboardLayoutClientComponent)
