"use client"

import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import { SignInPrompt } from "@/components/auth/SignInPrompt"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

const getInitials = (name?: string | null) => {
  if (!name) return "NE"
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.at(0) ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return initials || "NE"
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020618] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <SignInPrompt
            title="Sign in to view your profile"
            description="Access and update your personal information, connected accounts, and recent activity."
            redirectTo="/profile"
          />
        </div>
      </div>
    )
  }

  const displayName = session?.user?.name ?? "Guest explorer"
  const initials = getInitials(session?.user?.name)

  return (
    <div className="min-h-screen bg-[#020618]">
      <div className="container mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
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

        <Card className="border-white/10 bg-gradient-to-br from-indigo-600/20 via-sky-500/10 to-transparent text-white shadow-[0_40px_120px_-45px_rgba(56,189,248,0.7)]">
          <CardHeader className="flex flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20 rounded-2xl border border-white/40">
                <AvatarImage src={session?.user?.image ?? undefined} alt={displayName} />
                <AvatarFallback className="rounded-2xl text-xl text-[#020618]">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-2xl sm:text-3xl">{displayName}</CardTitle>
                <CardDescription className="text-base text-white/80">
                  {session?.user?.email ?? "Sign in to personalize your profile."}
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-white/40 bg-white/10 text-white">
                    Member since 2025
                  </Badge>
                  <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                    12 published labs
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              className="h-11 w-full rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 md:w-auto"
            >
              View public profile
            </Button>
          </CardHeader>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)]">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="px-6 pt-6">
              <CardTitle>Personal details</CardTitle>
              <CardDescription className="text-white/70">
                Update the short bio and headline visitors see on your lab pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6">
              <div className="space-y-2">
                <label htmlFor="profile-headline" className="text-sm font-medium text-white/80">
                  Headline
                </label>
                <Input
                  id="profile-headline"
                  placeholder="Network automation enthusiast"
                  className="border-white/20 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-white/40"
                />
                <p className="text-xs text-white/60">
                  Share a short phrase that highlights your focus or speciality.
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="profile-bio" className="text-sm font-medium text-white/80">
                  About you
                </label>
                <Textarea
                  id="profile-bio"
                  rows={5}
                  placeholder="Tell others about your lab interests, certifications, or current study goals."
                  className="border-white/20 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-white/40"
                />
              </div>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-xs text-white/60">
                  Only authenticated users can save changes. Drafts autosave every 2 minutes.
                </p>
                <Button
                  className="h-11 w-full rounded-full bg-white text-[#020618] hover:bg-white/90 sm:w-auto"
                  disabled={!session?.user}
                >
                  Save profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 text-white">
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription className="text-white/70">
                  Track the latest labs you touched.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-white/80">
                <p>- Redesigned &quot;Campus Fabric EVPN&quot; yesterday</p>
                <p>- Commented on &quot;Zero-Trust Access Lab&quot;</p>
                <p>- Uploaded topology image for &quot;MPLS Hub &amp; Spoke&quot;</p>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle>Connected accounts</CardTitle>
                <CardDescription className="text-white/70">
                  Use identity providers to sign in faster.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary" className="w-full justify-center border-white/20 bg-white/10 text-white">
                  BetterAuth
                </Badge>
                <Badge variant="secondary" className="w-full justify-center border-white/20 bg-white/10 text-white">
                  Supabase
                </Badge>
                <p className="text-xs text-white/60">
                  Additional identity providers will be listed here once linked.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
