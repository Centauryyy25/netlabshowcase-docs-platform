import { Suspense } from "react"
import SignUpContent from "./SignUpContent"

export const dynamic = "force-dynamic"

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading sign up...</div>}>
      <SignUpContent />
    </Suspense>
  )
}

