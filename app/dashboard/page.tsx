import { Suspense } from "react"
import DashboardContent from "./DashboardContent"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}

