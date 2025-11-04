"use client"

import type { CSSProperties, ReactNode } from "react"
import { Suspense, lazy, memo } from "react"

import DashboardViewRenderer from "@/components/dashboard/DashboardViewRenderer"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"

import { DashboardViewProvider } from "./DashboardViewContext"

const LazyAppSidebar = lazy(() => import("@/components/app-sidebar"))

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
        <Suspense
          fallback={
            <div className="bg-muted/20 p-4" style={{ width: "calc(var(--spacing) * 72)" }}>
              Loading sidebar...
            </div>
          }
        >
          <LazyAppSidebar variant="inset" />
        </Suspense>
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <DashboardViewRenderer />
            {children}
          </div>
        </SidebarInset>
      </DashboardViewProvider>
    </SidebarProvider>
  )
}

export const DashboardLayoutClient = memo(DashboardLayoutClientComponent)
