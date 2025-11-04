import type { ReactNode } from "react"
import { cookies } from "next/headers"

import "@/app/dashboard/theme.css"
import { ModalManagerProvider } from "@/context/ModalManagerContext"
import { DashboardLayoutClient } from "./DashboardLayoutClient"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <ModalManagerProvider>
      <DashboardLayoutClient defaultOpen={defaultOpen}>{children}</DashboardLayoutClient>
    </ModalManagerProvider>
  )
}
