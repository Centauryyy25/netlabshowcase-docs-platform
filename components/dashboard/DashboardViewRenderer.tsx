'use client'

import { Suspense, useMemo } from 'react'

import { useDashboardView } from '@/app/dashboard/DashboardViewContext'
import { viewRegistry } from '@/components/dashboard/view-registry'

export default function DashboardViewRenderer() {
  const { activeView } = useDashboardView()
  const ViewComponent = useMemo(() => viewRegistry[activeView], [activeView])

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <ViewComponent />
    </Suspense>
  )
}
