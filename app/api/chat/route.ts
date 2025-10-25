import { NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { db } from "@/db"
import { labFiles, labs } from "@/db"
import { eq } from "drizzle-orm"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const promptTemplates = {
  explain: "Explain this network topology and configuration in detail:",
  summarize: "Summarize the key concepts and learning objectives of this lab:",
  troubleshoot: "Help me troubleshoot potential issues in this network configuration:",
  improve: "Suggest improvements or best practices for this network topology:",
  general: "I'm here to help you understand this networking lab. What would you like to know?",
} as const

const REQUEST_TIMEOUT_MS = 20_000
const GROQ_MODEL = "moonshotai/kimi-k2-instruct-0905"
const OPENAI_MODEL = "gpt-4o-mini"
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

type ChatMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

type ChatPayload = {
  messages: ChatMessage[]
  labId?: string
  promptType?: keyof typeof promptTemplates | string
}

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number) =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
    ),
  ])

const readErrorStatus = (error: unknown): number | undefined => {
  if (typeof error === "object" && error !== null && "status" in error) {
    const candidate = (error as { status?: unknown }).status
    return typeof candidate === "number" ? candidate : undefined
  }
  return undefined
}

type GroqChoice = {
  message?: {
    content?: string
  }
}

type GroqResponse = {
  choices?: GroqChoice[]
  usage?: {
    completion_tokens?: number
    prompt_tokens?: number
    total_tokens?: number
  }
  error?: {
    message?: string
  }
}

const extractGroqMessage = (data: GroqResponse): string =>
  data?.choices?.[0]?.message?.content?.trim() ?? ""

export async function POST(request: NextRequest) {
  const startedAt = Date.now()

  try {
    const body = (await request.json()) as ChatPayload
    const { messages, labId, promptType = "general" } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Valid messages array is required" },
        { status: 400 }
      )
    }

    let labContext = ""

    if (labId) {
      try {
        const [labData] = await db
          .select({
            title: labs.title,
            description: labs.description,
            category: labs.category,
            difficulty: labs.difficulty,
            tags: labs.tags,
          })
          .from(labs)
          .where(eq(labs.id, labId))

        if (labData) {
          const files = await db
            .select({
              fileName: labFiles.fileName,
              fileType: labFiles.fileType,
              description: labFiles.description,
            })
            .from(labFiles)
            .where(eq(labFiles.labId, labId))

          labContext = `Lab Context:
- Title: ${labData.title}
- Description: ${labData.description}
- Category: ${labData.category}
- Difficulty Level: ${labData.difficulty}
- Tags: ${labData.tags?.join(", ") || "None"}
- Available Files: ${
            files.length > 0
              ? files.map((f) => `${f.fileName} (${f.fileType})`).join(", ")
              : "None"
          }

You are a networking expert assistant helping students understand this lab. Provide clear, educational responses that help with learning network concepts, configurations, and troubleshooting. Be encouraging and thorough in your explanations.`
        }
      } catch (error) {
        console.error("Error fetching lab context:", error)
      }
    }

    const template =
      promptTemplates[promptType as keyof typeof promptTemplates] ??
      promptTemplates.general
    const systemPrompt = `${template}\n\n${labContext}`.trim()

    const sanitizedMessages: ChatMessage[] = messages.map((message) => ({
      role:
        message.role === "system"
          ? "system"
          : message.role === "assistant"
            ? "assistant"
            : "user",
      content: typeof message.content === "string" ? message.content : "",
    }))

    const callGroqProvider = async () => {
      if (!process.env.GROQ_API_KEY) {
        throw Object.assign(new Error("GROQ_API_KEY is not configured"), {
          status: 401,
        })
      }

      console.log("[AI Chat] Using Groq provider:", GROQ_MODEL)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      try {
        const response = await fetch(GROQ_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              ...sanitizedMessages,
            ],
            temperature: 0.7,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => null)) as GroqResponse | null
          throw Object.assign(
            new Error(
              errorBody?.error?.message ||
                `Groq request failed with status ${response.status}`
            ),
            { status: response.status, data: errorBody }
          )
        }

        const data = (await response.json()) as GroqResponse

        return {
          provider: "groq" as const,
          message: extractGroqMessage(data),
          usage: data?.usage ?? null,
        }
      } finally {
        clearTimeout(timeoutId)
      }
    }

    const callOpenAiProvider = async () => {
      if (!process.env.OPENAI_API_KEY) {
        throw Object.assign(new Error("OPENAI_API_KEY is not configured"), {
          status: 401,
        })
      }

      console.warn("[AI Chat] Falling back to OpenAI provider:", OPENAI_MODEL)

      const result = await withTimeout(
        generateText({
          model: openai(OPENAI_MODEL),
          system: systemPrompt,
          messages: sanitizedMessages,
          temperature: 0.7,
          maxOutputTokens: 1200,
        }),
        REQUEST_TIMEOUT_MS
      )

      return {
        provider: "openai" as const,
        message: result.text,
        usage: result.usage ?? null,
      }
    }

    const attemptGroqFirst = async () => {
      try {
        return await callGroqProvider()
      } catch (error) {
        console.error("[AI Chat] Groq error:", error)

        const hasOpenAi = Boolean(process.env.OPENAI_API_KEY)
        if (!hasOpenAi) {
          throw Object.assign(
            new Error(
              "Groq request failed and no OPENAI_API_KEY is configured for fallback"
            ),
            { status: readErrorStatus(error) ?? 500 }
          )
        }

        console.warn("[AI Chat] Switching to OpenAI fallback after Groq failure.")
        return await callOpenAiProvider()
      }
    }

    const result = await attemptGroqFirst()

    return NextResponse.json({
      success: true,
      provider: result.provider,
      message: result.message,
      usage: result.usage,
      latencyMs: Date.now() - startedAt,
      labId,
      promptType,
    })
  } catch (error) {
    console.error("[AI Chat] Unhandled error:", error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI Chat API is working",
    availablePrompts: Object.keys(promptTemplates),
    usage: "POST with { messages: [...], labId?: string, promptType?: string }",
    providers: {
      primary: { name: "groq", model: GROQ_MODEL },
      fallback: { name: "openai", model: OPENAI_MODEL },
    },
  })
}



