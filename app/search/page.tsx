"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LabCard } from "@/components/lab-card"
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
    name: string
    image?: string | null
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!query.trim()) {
      toast.warning("Enter a keyword, category, or author name to search.")
      return
    }

    try {
      setLoading(true)
      setHasSearched(true)
      const params = new URLSearchParams({ search: query.trim(), status: "published", limit: "24" })
      const response = await fetch(`/api/labs?${params.toString()}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Search failed. Try again in a moment.")
      }

      const payload = await response.json()
      setLabs(payload?.labs ?? [])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed. Try again in a moment."
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Search</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Global Search</h1>
        <p className="text-muted-foreground">
          Explore labs, categories, and author contributions across the entire NetLabShowcase library.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search labs by title, technology, or author"
          className="sm:max-w-xl"
        />
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
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
      ) : hasSearched && labs.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="space-y-4">
            <CardTitle>No labs found</CardTitle>
            <CardDescription>
              Try a different keyword or browse categories to discover new topologies.
            </CardDescription>
            <Button asChild variant="outline">
              <Link href="/categories">Browse categories</Link>
            </Button>
          </CardContent>
        </Card>
      ) : labs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      ) : null}
    </div>
  )
}
