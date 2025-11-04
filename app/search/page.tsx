"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
  const quickFilters = useMemo(
    () => ["MPLS", "Automation", "Wireless", "Beginner", "Security", "Datacenter"],
    []
  )

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      toast.warning("Enter a keyword, category, or author name to search.")
      return
    }

    try {
      setLoading(true)
      setHasSearched(true)
      const params = new URLSearchParams({ search: term.trim(), status: "published", limit: "24" })
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

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await performSearch(query)
  }

  const handleQuickSearch = (term: string) => {
    setQuery(term)
    void performSearch(term)
  }

  return (
    <div className="min-h-screen bg-[#020618]">
      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
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

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-sky-500/10 to-transparent p-6 text-white shadow-[0_40px_120px_-50px_rgba(56,189,248,0.7)] sm:p-10">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-white/70">Explore everything</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Search NetLabShowcase</h1>
            <p className="max-w-3xl text-base text-white/80">
              Find verified labs, reusable templates, and expert authors. Results stream in real time as we fetch from
              the public catalog.
            </p>
          </div>
          <form
            onSubmit={handleSearch}
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-inner sm:flex-row"
          >
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, technology, author, or tag"
              className="border-none bg-transparent text-base text-white placeholder:text-white/60 focus-visible:ring-white/50"
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-xl bg-white text-[#020618] hover:bg-white/90 sm:w-40"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <Button
                key={filter}
                variant="secondary"
                size="sm"
                className="rounded-full border border-white/20 bg-white/10 text-xs text-white hover:bg-white/20"
                onClick={() => handleQuickSearch(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr),minmax(0,1fr)]">
          <div className="space-y-6">
            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="border-white/10 bg-white/5">
                    <Skeleton className="h-40 w-full rounded-t-lg" />
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
              <Card className="border-white/10 bg-white/5 text-white">
                <CardContent className="space-y-6 py-10 text-center">
                  <CardTitle className="text-2xl">No labs found</CardTitle>
                  <CardDescription className="text-base text-white/70">
                    Try different keywords or jump into curated categories curated by our instructors.
                  </CardDescription>
                  <Button
                    asChild
                    variant="secondary"
                    className="mx-auto h-11 w-full max-w-xs rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Link href="/categories">Browse categories</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : labs.length > 0 ? (
              <div className="space-y-4 text-white">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm uppercase tracking-wide text-white/60">
                    Showing {labs.length} result{labs.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
              </div>
            ) : (
              <Card className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl">Ready when you are</CardTitle>
                  <CardDescription className="text-base text-white/70">
                    Start searching to see featured labs, trending topologies, and author spotlights.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-white/70">
                  Use filters like <span className="font-semibold text-white">&quot;MPLS&quot;</span> or{" "}
                  <span className="font-semibold text-white">&quot;Wireless Site Survey&quot;</span> to jump straight into curated
                  playlists.
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Search tips</CardTitle>
                <CardDescription className="text-white/70">
                  Fine-tune results with advanced operators.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/80">
                <p>
                  - Combine keywords: <span className="font-medium text-white">&quot;MPLS&quot; + &quot;Intermediate&quot;</span>
                </p>
                <p>
                  - Filter drafts you own with <span className="font-medium text-white">author:me</span>
                </p>
                <p>
                  - Add <span className="font-medium text-white">status:draft</span> or <span className="font-medium text-white">status:published</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-gradient-to-br from-primary/20 to-emerald-500/20 text-white">
              <CardHeader>
                <CardTitle>Need curated help?</CardTitle>
                <CardDescription className="text-white/75">
                  Our editors assemble fresh lists every Monday.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="h-11 w-full rounded-full bg-white text-[#020618] hover:bg-white/90"
                >
                  <Link href="/resources">View curation board</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
