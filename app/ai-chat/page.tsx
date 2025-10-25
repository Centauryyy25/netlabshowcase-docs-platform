import { Suspense } from "react"
import AiChatContent from "./AiChatContent"

export const dynamic = "force-dynamic"

export default function AiChatPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading chat...</div>}>
      <AiChatContent />
    </Suspense>
  )
}

