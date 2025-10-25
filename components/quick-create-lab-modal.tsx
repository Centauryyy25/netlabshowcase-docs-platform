"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { z } from "zod"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import UploadTopologyImage from "@/components/labs/UploadTopologyImage"
import { cn } from "@/lib/utils"

const categories = [
  "Routing",
  "Switching",
  "Security",
  "MPLS",
  "Wireless",
  "Voice",
  "Data Center",
  "Other",
] as const

const difficulties = ["Beginner", "Intermediate", "Advanced"] as const

const quickCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Keep the description short for quick create"),
  category: z.enum(categories),
  difficulty: z.enum(difficulties),
})

type QuickCreateValues = z.infer<typeof quickCreateSchema>

interface QuickCreateLabModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickCreateLabModal({ open, onOpenChange }: QuickCreateLabModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [topologyImageUrl, setTopologyImageUrl] = useState<string | null>(null)

  const form = useForm<QuickCreateValues>({
    resolver: zodResolver(quickCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Routing",
      difficulty: "Beginner",
    },
  })

  const resetState = () => {
    form.reset()
    setTopologyImageUrl(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      resetState()
    }
  }

  const handleSubmit: SubmitHandler<QuickCreateValues> = async (values) => {
    if (!session?.user) {
      toast.error("You need to be signed in to create a lab.")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("/api/labs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          category: values.category,
          difficulty: values.difficulty,
          user_id: session.user.id,
          topology_image_url: topologyImageUrl,
          status: "published",
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message =
          typeof payload?.error === "string" ? payload.error : "Failed to create lab. Please try again."
        throw new Error(message)
      }

      const payload = await response.json()
      const createdLabId: string | undefined = payload?.data?.id

      toast.success("Lab created successfully!")
      handleOpenChange(false)

      if (createdLabId) {
        router.push(`/labs/${createdLabId}`)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create lab. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-w-lg bg-sidebar border border-white/5 text-sidebar-foreground",
          "backdrop-blur supports-[backdrop-filter]:bg-sidebar/70"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Quick Create Lab</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Capture the essentials to publish a new lab in seconds. You can always refine it later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MPLS Layer 3 VPN Topology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Brief summary of the lab objectives and expected outcomes."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty} value={difficulty}>
                            {difficulty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Topology Preview</FormLabel>
              <p className="text-xs text-muted-foreground">
                Optional. Upload a quick snapshot of the lab topology to make your listing stand out.
              </p>
              <UploadTopologyImage
                prefix="quick-create"
                onUploaded={(publicUrl) => {
                  setTopologyImageUrl(publicUrl)
                }}
              />
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Lab"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

