'use client'

import { lazy, type LazyExoticComponent, type ReactElement } from 'react'

import type { DashboardViewKey } from '@/app/dashboard/DashboardViewContext'

const ViewHome = lazy(() => import('@/components/dashboard/views/home'))
const ViewUpload = lazy(() => import('@/components/dashboard/views/upload'))
const ViewMyLabs = lazy(() => import('@/components/dashboard/views/mylabs'))
const ViewMpls = lazy(() => import('@/components/dashboard/views/mpls'))
const ViewAI = lazy(() => import('@/components/dashboard/views/ai'))
const ViewCategories = lazy(() => import('@/components/dashboard/views/categories'))
const ViewMore = lazy(() => import('@/components/dashboard/views/more'))

type ViewComponent = LazyExoticComponent<() => ReactElement>

export const viewRegistry: Record<DashboardViewKey, ViewComponent> = {
  home: ViewHome,
  upload: ViewUpload,
  mylabs: ViewMyLabs,
  mpls: ViewMpls,
  ai: ViewAI,
  categories: ViewCategories,
  more: ViewMore,
}
