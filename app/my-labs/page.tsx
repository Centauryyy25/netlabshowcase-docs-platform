"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { LabCard } from "@/components/lab-card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Lab = {
  id: string
  title: string
  description: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  status: string
  tags: string[]
  topologyImageUrl?: string | null
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
    image?: string | null
  }
}

export default function MyLabsPage() {
  const { data: session, isPending } = useSession()
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchMyLabs = async () => {
      if (!session?.user) return

      try {
        setLoading(true)
        const response = await fetch(`/api/labs?userId=${session.user.id}&status=all`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to load your labs")
        }

        const payload = await response.json()
        setLabs(payload?.labs ?? [])
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load your labs"
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    fetchMyLabs()
  }, [session?.user])

  const isAuthenticated = useMemo(() => Boolean(session?.user), [session?.user])

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>My Labs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">My Labs</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Review and manage every topology you have created for the community.
          </p>
        </div>
        <Button asChild size="lg" className="h-11 w-full sm:w-auto">
          <Link href="/upload">Create New Lab</Link>
        </Button>
      </div>

      {isPending ? (
        <Card className="max-w-md">
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <CardTitle>Loading your session</CardTitle>
            <CardDescription>Hang tight, we are verifying your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-5 pt-0 sm:px-6">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ) : !isAuthenticated ? (
        <Card className="max-w-lg">
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <CardTitle>Sign in to view your labs</CardTitle>
            <CardDescription>Access private drafts and manage your published work.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-4 pb-5 pt-0 sm:flex-row sm:px-6">
            <Button asChild className="h-11 w-full sm:w-auto">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-full">
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : labs.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-4">
            <div className="text-muted-foreground">You have not created any labs yet.</div>
            <Button asChild className="h-11 w-full sm:w-auto">
              <Link href="/upload">Publish your first lab</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {labs.map((lab) => (
            <LabCard
              key={lab.id}
              id={lab.id}
              title={lab.title}
              description={lab.description}
              category={lab.category}
              difficulty={lab.difficulty}
              tags={lab.tags}
              createdAt={lab.createdAt}
              topologyImageUrl={lab.topologyImageUrl ?? undefined}
              author={{
                id: lab.author.id,
                name: lab.author.name ?? "Unknown Author",
                image: lab.author.image ?? undefined,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
