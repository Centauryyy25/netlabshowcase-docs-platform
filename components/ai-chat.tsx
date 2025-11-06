"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Bot,
  Check,
  Copy,
  Download,
  Lightbulb,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Wrench,
  BookOpen,
} from "lucide-react"
import { toast } from "sonner"

type MessageRole = "user" | "assistant"

interface InitialMessage {
  id: string
  role: MessageRole | "system"
  content: string
}

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
}

interface AiChatProps {
  labId?: string
  labTitle?: string
  initialMessages?: InitialMessage[]
  className?: string
  onMessageSent?: (message: string) => void
}

const promptOptions = [
  {
    value: "explain",
    label: "Explain Topology",
    icon: BookOpen,
    description: "Explain this network topology and configuration",
  },
  {
    value: "summarize",
    label: "Summarize Lab",
    icon: Sparkles,
    description: "Summarize key concepts and learning objectives",
  },
  {
    value: "troubleshoot",
    label: "Troubleshoot",
    icon: Wrench,
    description: "Help troubleshoot potential issues",
  },
  {
    value: "improve",
    label: "Suggest Improvements",
    icon: TrendingUp,
    description: "Suggest improvements and best practices",
  },
] as const

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

export function AiChat({
  labId,
  labTitle,
  initialMessages = [],
  className,
  onMessageSent,
}: AiChatProps) {
  const [promptType, setPromptType] = useState<string>("general")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        id: message.id,
        role: message.role as MessageRole,
        content: message.content,
      }))
  )

  const messagesRef = useRef<ChatMessage[]>(messages)
  const abortRef = useRef<AbortController | null>(null)
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const scrollToBottom = useCallback(() => {
    const node = scrollContainerRef.current
    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, typingMessageId, scrollToBottom])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [])

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const typeAssistantMessage = useCallback(
    (fullText: string) => {
      const messageId = createId()
      appendMessage({ id: messageId, role: "assistant", content: "" })
      setTypingMessageId(messageId)

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }

      const characters = Array.from(fullText)
      let index = 0
      const delay = Math.min(40, Math.max(14, Math.floor(600 / (characters.length || 1))))

      typingIntervalRef.current = setInterval(() => {
        index += 1
        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? { ...message, content: characters.slice(0, index).join("") }
              : message
          )
        )
        if (index >= characters.length) {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current)
            typingIntervalRef.current = null
          }
          setTypingMessageId(null)
        }
      }, delay)
    },
    [appendMessage]
  )

  const stop = useCallback(() => {
    if (abortRef.current && !abortRef.current.signal.aborted) {
      abortRef.current.abort('stopped-by-user')
    }
    abortRef.current = null
    setIsLoading(false)
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }
    setTypingMessageId(null)
  }, [])

  const submitMessage = useCallback(
    async (content: string, overridePrompt?: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading) return

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
      }

      appendMessage(userMessage)
      onMessageSent?.(trimmed)
      setInput("")
      setError(null)
      setIsLoading(true)

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const history = [...messagesRef.current, userMessage]
      const payloadMessages = history.map((message) => ({
        role: message.role,
        content: message.content,
      }))

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: payloadMessages,
            labId,
            promptType: overridePrompt ?? promptType,
          }),
          signal: controller.signal,
        })

        const data = await response.json().catch(() => null)

        if (!response.ok || !data) {
          throw new Error(data?.error || "Chat request failed")
        }

        if (!data.success) {
          throw new Error(data.error || "Assistant could not process the request")
        }

        const reply =
          typeof data.message === "string" && data.message.trim().length > 0
            ? data.message.trim()
            : "I couldn't generate a response. Please try again."

        typeAssistantMessage(reply)
        setIsLoading(false)

        if (data.provider) {
          console.info(`[AI Chat] response provider: ${data.provider}`)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          console.info("[AI Chat] request aborted by user.")
          setIsLoading(false)
          abortRef.current = null
          setTypingMessageId(null)
          return
        }

        const message =
          err instanceof Error ? err.message : "Unexpected error occurred. Please retry."
        console.error("[AI Chat] request error:", err)
        setIsLoading(false)
        abortRef.current = null
        setTypingMessageId(null)
        setError(message)
        toast.error(message)
      } finally {
        abortRef.current = null
      }
    },
    [appendMessage, isLoading, labId, onMessageSent, promptType, typeAssistantMessage]
  )

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      submitMessage(input)
    },
    [input, submitMessage]
  )

  const handlePromptSelect = useCallback(
    (value: string) => {
      setPromptType(value)
      const preset = promptOptions.find((option) => option.value === value)
      if (preset) {
        submitMessage(preset.description, value)
        return
      }
      if (value === "general") {
        submitMessage(
          "Give me an overview of this lab and the recommended steps to approach the topology.",
          value
        )
      }
    },
    [submitMessage]
  )

  const handleCopyMessage = useCallback(async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast.success("Message copied to clipboard")
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy message:", err)
      toast.error("Failed to copy message")
    }
  }, [])

  const handleExportConversation = useCallback(() => {
    const exportContent = messagesRef.current
      .map((message) => `${message.role === "user" ? "You" : "Assistant"}:\n${message.content}`)
      .join("\n\n")

    const blob = new Blob([exportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${
      labTitle?.toLowerCase().replace(/\s+/g, "-") || "netlab"
    }-ai-assistant.txt`
    link.click()
    URL.revokeObjectURL(url)

    toast.success("Chat exported successfully")
  }, [labTitle])

  const handleClearConversation = useCallback(() => {
    setMessages([])
    setError(null)
    setTypingMessageId(null)
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }
  }, [])

  const handleRetry = useCallback(() => {
    const lastUser = [...messagesRef.current].reverse().find((message) => message.role === "user")
    if (lastUser) {
      submitMessage(lastUser.content)
    }
  }, [submitMessage])

  const hasMessages = messages.length > 0
  const isAssistantTyping = Boolean(typingMessageId)

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-xl shadow-slate-200/40 backdrop-blur-md transition-colors dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-black/30",
          className,
        )}
      >
        <CardHeader className="space-y-5 border-b border-slate-200/70 bg-white/80 px-5 py-6 dark:border-slate-800/60 dark:bg-slate-900/60 sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Bot className="size-5 text-primary" />
                AI Lab Assistant
                {labTitle && (
                  <Badge variant="outline" className="ml-2 text-xs uppercase tracking-wide">
                    {labTitle}
                  </Badge>
                )}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask anything about this lab’s topology, configurations, or troubleshooting.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={handleExportConversation}
                >
                  <Download className="mr-2 size-4" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={handleClearConversation}
                >
                  <Trash2 className="mr-2 size-4" />
                  Clear
                </Button>
              </div>
              {isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stop}
                  className="text-destructive sm:flex-none"
                >
                  Stop
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Select value={promptType} onValueChange={setPromptType}>
              <SelectTrigger className="w-full text-sm sm:w-[220px]">
                <SelectValue placeholder="Prompt style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="size-4" />
                    General Guidance
                  </div>
                </SelectItem>
                {promptOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="size-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-sm sm:w-auto"
              disabled={isLoading}
              onClick={() => handlePromptSelect(promptType)}
            >
              <Sparkles className="mr-2 size-4" />
              Quick Prompt
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-[420px] flex-1 flex-col overflow-hidden px-0 pb-0 pt-4 sm:pt-6">
          <div
            ref={scrollContainerRef}
            className="flex-1 space-y-5 overflow-y-auto px-4 pb-6 sm:px-6 sm:pb-8"
          >
            {!hasMessages ? (
              <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/15 px-6 py-10 text-center sm:px-10 sm:py-12">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lightbulb className="size-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Start the conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Summon the assistant to explain configurations, troubleshoot issues, or suggest
                    improvements tailored to this lab.
                  </p>
                </div>
                <div className="grid w-full gap-2 sm:grid-cols-2">
                  {promptOptions.slice(0, 4).map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromptSelect(option.value)}
                      disabled={isLoading}
                      className="justify-start gap-2 rounded-full border-muted-foreground/20 bg-background/80 px-4 py-2 text-left text-xs hover:border-primary/30 hover:bg-primary/10 sm:px-5 sm:py-2.5"
                    >
                      <option.icon className="size-4 flex-shrink-0" />
                      {option.description}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.role === "user"
                return (
                  <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex max-w-[85%] items-end gap-3 ${
                        isUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex size-9 items-center justify-center rounded-full border ${
                          isUser
                            ? "border-primary/40 bg-primary text-primary-foreground"
                            : "border-muted-foreground/25 bg-muted text-muted-foreground"
                        }`}
                      >
                        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                      </div>
                      <div className="group relative">
                        <div
                          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm shadow-sm transition-colors sm:rounded-3xl sm:px-5 sm:py-4 ${
                            isUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {message.content}
                          {typingMessageId === message.id && <span className="animate-pulse">▌</span>}
                        </div>
                        <div className="mt-1 flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 text-muted-foreground"
                                onClick={() => handleCopyMessage(message.content, message.id)}
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="size-3" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy message</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {isLoading && !isAssistantTyping && (
              <div className="flex items-end gap-3">
                <div className="flex size-9 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground sm:rounded-3xl sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-muted-foreground/60" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:120ms]" />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:240ms]" />
                    </span>
                    <span>Assistant is thinking…</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-end gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:rounded-3xl sm:px-5">
                  <p>{error}</p>
                  <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs" onClick={handleRetry}>
                    Try again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800/60 dark:bg-slate-900/70 sm:px-6">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                labId ? "Ask about this network lab…" : "Ask me about networking concepts…"
              }
              disabled={isLoading}
              className="flex-1 rounded-full bg-muted/70 px-5 py-5 text-sm shadow-inner transition-colors focus-visible:ring-1 focus-visible:ring-primary/50"
            />
            <Button
              type="submit"
              size="icon"
              className="size-11 rounded-full"
              disabled={isLoading || input.trim().length === 0}
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}
