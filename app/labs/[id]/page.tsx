import { Suspense } from "react"
import LabDetailContent from "./LabDetailContent"

export const dynamic = "force-dynamic"

export default function LabDetailPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading lab...</div>}>
      <LabDetailContent />
    </Suspense>
  )
}

