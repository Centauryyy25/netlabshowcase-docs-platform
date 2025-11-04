"use client"

import { Suspense } from "react"

import AiChatContent from "@/app/ai-chat/AiChatContent"

export default function ViewAI() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading chat...</div>}>
      <div className="bg-white dark:bg-[#020618]">
        <AiChatContent />
      </div>
    </Suspense>
  )
}
