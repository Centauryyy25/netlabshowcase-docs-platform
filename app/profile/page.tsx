"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

export default function ProfilePage() {
  const { data: session } = useSession()

  const displayName = session?.user?.name ?? "Guest explorer"
  const initials = useMemo(() => {
    const name = session?.user?.name
    return name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "NE"
  }, [session?.user?.name])

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
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border-border/50 bg-muted/10 backdrop-blur">
        <CardHeader className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarImage src={session?.user?.image ?? undefined} alt={displayName} />
              <AvatarFallback className="rounded-lg text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-semibold sm:text-2xl">{displayName}</CardTitle>
              <CardDescription className="text-sm leading-relaxed sm:text-base">
                {session?.user?.email ?? "Sign in to personalize your profile."}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="self-start">
            Member since 2025
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-6 px-4 pb-5 pt-0 sm:px-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="profile-headline" className="text-sm font-medium">
                Headline
              </label>
              <Input id="profile-headline" placeholder="Network automation enthusiast" />
              <p className="text-xs text-muted-foreground">
                Share a short phrase that highlights your focus or speciality.
              </p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="profile-bio" className="text-sm font-medium">
                About you
              </label>
              <Textarea
                id="profile-bio"
                rows={5}
                placeholder="Tell others about your lab interests, certifications, or current study goals."
              />
            </div>
            <div className="flex justify-end">
              <Button className="h-11 w-full sm:w-auto" disabled={!session?.user}>
                Save profile
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-border/40 bg-background/50 p-4">
              <p className="text-sm font-medium">Recent activity</p>
              <p className="text-xs text-muted-foreground">
                Keep track of labs you have published or collaborated on. Activity history will appear here.
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-border/40 bg-background/50 p-4">
              <p className="text-sm font-medium">Connected accounts</p>
              <Badge variant="outline">BetterAuth</Badge>
              <Badge variant="outline">Supabase</Badge>
              <p className="text-xs text-muted-foreground">
                Additional identity providers will be listed here once linked.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
