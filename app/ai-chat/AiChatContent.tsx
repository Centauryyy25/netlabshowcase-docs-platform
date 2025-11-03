"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AiChat } from "@/components/ai-chat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Bot } from "lucide-react"

interface LabSummary {
  id: string
  title: string
  description: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
}

const FALLBACK_MESSAGE = "Loading chat..."

export default function AiChatContent() {
  const searchParams = useSearchParams()
  const labId = searchParams.get("labId")
  const [labData, setLabData] = useState<LabSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchLabData = useCallback(async () => {
    if (!labId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/labs/${labId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch lab data")
      }
      const data = (await response.json()) as { lab: LabSummary }
      setLabData(data.lab ?? null)
    } catch (error) {
      console.error("Error fetching lab data:", error)
      toast.error("Failed to load lab information")
    } finally {
      setLoading(false)
    }
  }, [labId])

  useEffect(() => {
    void fetchLabData()
  }, [fetchLabData])

  return (
    <div className="container mx-auto py-8 space-y-6 bg-white dark:bg-[#020618]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Labs
              </Link>
            </Button>
          </div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Bot className="h-8 w-8" />
            AI Lab Assistant
          </h1>
          <p className="text-muted-foreground">
            Get help understanding network configurations, topologies, and concepts
            {labData && ` for "${labData.title}"`}
          </p>
        </div>

        {labData && (
          <Button asChild>
            <Link href={`/labs/${labId}`}>
              <BookOpen className="mr-2 h-4 w-4" />
              View Lab
            </Link>
          </Button>
        )}
      </div>

      {labData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lab Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
                <p>{labData.title}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                <p>{labData.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Difficulty</h4>
                <p>{labData.difficulty}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm">{labData.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mx-auto max-w-4xl">
        {loading ? (
          <Card className="flex h-[600px] items-center justify-center">
            <CardContent>
              <div className="space-y-4 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                <p>{FALLBACK_MESSAGE}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AiChat
            labId={labId || undefined}
            labTitle={labData?.title}
            className="h-[600px]"
            onMessageSent={(message) => {
              console.log("Message sent:", message)
            }}
          />
        )}
      </div>

      {!labData && (
        <Card>
          <CardHeader>
            <CardTitle>How to Use the AI Assistant</CardTitle>
            <CardDescription>Get the most out of your AI lab assistant with these tips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium">General Questions</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Explain networking concepts (OSI model, TCP/IP, etc.)</li>
                  <li>• Understand protocol behavior (OSPF, BGP, EIGRP)</li>
                  <li>• Learn about network devices and their roles</li>
                  <li>• Get help with command syntax and configuration</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Lab-Specific Help</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Access from a specific lab page for contextual help</li>
                  <li>• Use quick prompts for explanations and summaries</li>
                  <li>• Get troubleshooting assistance for configurations</li>
                  <li>• Receive suggestions for network improvements</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Pro tip:</strong> For the best experience, navigate to a specific lab page and use the AI
                Assistant there. The assistant will have full context about the lab topology, configurations, and
                learning objectives.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

