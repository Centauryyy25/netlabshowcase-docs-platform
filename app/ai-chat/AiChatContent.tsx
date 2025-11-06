"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AiChat } from "@/components/ai-chat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Bot } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { SignInPrompt } from "@/components/auth/SignInPrompt"

interface LabSummary {
  id: string
  title: string
  description: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
}

const FALLBACK_MESSAGE = "Loading chat..."

const GENERAL_TIPS = [
  "Explain networking concepts (OSI model, TCP/IP, etc.)",
  "Understand protocol behavior (OSPF, BGP, EIGRP)",
  "Learn about network devices and their roles",
  "Get help with command syntax and configuration",
]

const LAB_TIPS = [
  "Access from a specific lab page for contextual help",
  "Use quick prompts for explanations and summaries",
  "Get troubleshooting assistance for configurations",
  "Receive suggestions for network improvements",
]

export default function AiChatContent() {
  const searchParams = useSearchParams()
  const labId = searchParams.get("labId")
  const [labData, setLabData] = useState<LabSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const { data: session, isPending } = useSession()
  const isAuthenticated = Boolean(session?.user)

  const fetchLabData = useCallback(async () => {
    if (!labId || !isAuthenticated) return

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
  }, [isAuthenticated, labId])

  useEffect(() => {
    void fetchLabData()
  }, [fetchLabData])

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-[#020618]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020618] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <SignInPrompt
            title="Sign in to use the AI Assistant"
            description="Authenticate to chat with the AI Lab Assistant and unlock contextual lab guidance."
            redirectTo="/ai-chat"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/[0.85] py-10 dark:bg-[#020618]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-black/30 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-10 rounded-full border border-transparent bg-primary/10 px-4 text-primary hover:bg-primary/20 dark:bg-primary/20"
                >
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Labs
                  </Link>
                </Button>
                {labData && (
                  <Badge
                    variant="outline"
                    className="rounded-full border border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/15"
                  >
                    Linked Lab
                  </Badge>
                )}
              </div>
              <div>
                <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  <Bot className="h-8 w-8 text-primary" />
                  AI Lab Assistant
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Get help understanding network configurations, topologies, and concepts
                  {labData
                    ? ` for "${labData.title}"`
                    : " with contextual guidance tailored to your network labs."}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              {labData && (
                <Button asChild className="h-11 rounded-full px-6 shadow-md shadow-primary/10">
                  <Link href={`/labs/${labId}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Lab Details
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]">
          <div className="flex flex-col gap-6">
            {labData && (
              <Card className="rounded-3xl border border-slate-200/70 bg-white/95 shadow-lg shadow-slate-200/30 dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-black/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold">Lab Context</CardTitle>
                  <CardDescription>Snapshot of the lab the assistant will reference.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/60 dark:bg-slate-900/60">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</dt>
                      <dd className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {labData.title}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/60 dark:bg-slate-900/60">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Category
                      </dt>
                      <dd className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {labData.category}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800/60 dark:bg-slate-900/60 sm:col-span-2">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Difficulty
                      </dt>
                      <dd className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-primary/20">
                        {labData.difficulty}
                      </dd>
                    </div>
                  </dl>
                  <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm leading-relaxed text-muted-foreground dark:border-slate-800/60 dark:bg-slate-900/60">
                    {labData.description}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-3xl border border-slate-200/70 bg-white/95 shadow-lg shadow-slate-200/30 dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-black/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">How to use the assistant</CardTitle>
                <CardDescription>
                  Get the most out of the AI lab assistant with these quick tips.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">General questions</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {GENERAL_TIPS.map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <span className="mt-1 inline-flex size-1.5 flex-none rounded-full bg-primary/60 dark:bg-primary/50" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Lab-specific help</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {LAB_TIPS.map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <span className="mt-1 inline-flex size-1.5 flex-none rounded-full bg-primary/60 dark:bg-primary/50" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground dark:border-primary/30 dark:bg-primary/15">
                  <strong className="text-primary dark:text-primary/90">Pro tip:</strong>{' '}
                  For the richest answers, open the assistant from a lab page so it can reference the topology,
                  configurations, and learning objectives.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex min-h-[560px] flex-col">
            {loading ? (
              <Card className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/40 dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-black/30">
                <CardContent className="flex flex-col items-center gap-4 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
                  <p className="text-sm text-muted-foreground">{FALLBACK_MESSAGE}</p>
                </CardContent>
              </Card>
            ) : (
              <AiChat
                labId={labId || undefined}
                labTitle={labData?.title}
                className="min-h-[620px]"
                onMessageSent={(message) => {
                  console.log('Message sent:', message)
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
