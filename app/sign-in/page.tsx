import { Suspense } from "react"
import SignInContent from "./SignInContent"

export const dynamic = "force-dynamic"

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading sign in...</div>}>
      <SignInContent />
    </Suspense>
  )
}

