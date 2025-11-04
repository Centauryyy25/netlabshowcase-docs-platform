'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type DashboardViewKey = 'home' | 'upload' | 'mylabs' | 'mpls' | 'ai' | 'categories' | 'more'

type DashboardViewContextValue = {
  activeView: DashboardViewKey
  setActiveView: (view: DashboardViewKey) => void
}

const DashboardViewContext = createContext<DashboardViewContextValue | null>(null)

type DashboardViewProviderProps = {
  children: ReactNode
  initialView?: DashboardViewKey
  syncWithURL?: boolean
}

export function DashboardViewProvider({
  children,
  initialView = 'home',
  syncWithURL = false,
}: DashboardViewProviderProps) {
  const [activeView, internalSetActiveView] = useState<DashboardViewKey>(initialView)

  const setActiveView = useCallback(
    (view: DashboardViewKey) => {
      internalSetActiveView(view)
      if (syncWithURL && typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.set('view', view)
        window.history.replaceState({}, '', url.toString())
      }
    },
    [syncWithURL]
  )

  useEffect(() => {
    if (!syncWithURL || typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const nextView = url.searchParams.get('view') as DashboardViewKey | null
    if (nextView) {
      internalSetActiveView(nextView)
    }
  }, [syncWithURL])

  const value = useMemo(
    () => ({
      activeView,
      setActiveView,
    }),
    [activeView, setActiveView]
  )

  return <DashboardViewContext.Provider value={value}>{children}</DashboardViewContext.Provider>
}

export function useDashboardView() {
  const context = useContext(DashboardViewContext)
  if (!context) {
    throw new Error('useDashboardView must be used within DashboardViewProvider')
  }
  return context
}
