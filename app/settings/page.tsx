"use client"

import { useState } from "react"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import { toast } from "sonner"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [displayName, setDisplayName] = useState(session?.user?.name ?? "")
  const [email, setEmail] = useState(session?.user?.email ?? "")
  const [darkMode, setDarkMode] = useState(true)
  const [labNotifications, setLabNotifications] = useState(true)

  const handleSave = () => {
    toast.success("Settings saved. Persistence will be wired up shortly.")
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
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, notification preferences, and connected services.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information and how other members see you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="display-name">Display name</Label>
                <Input
                  id="display-name"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Authentication provider</Label>
                <Input value="BetterAuth" readOnly className="bg-muted/50" />
              </div>
              <Button onClick={handleSave} className="ml-auto">
                Save changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Control theme, updates, and notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
                <div>
                  <p className="font-medium">Dark mode</p>
                  <p className="text-sm text-muted-foreground">Switch themes instantly across NetLabShowcase.</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
                <div>
                  <p className="font-medium">Lab updates</p>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when collaborators update shared labs.
                  </p>
                </div>
                <Switch checked={labNotifications} onCheckedChange={setLabNotifications} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Secure your account with additional protections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Reset password
              </Button>
              <Button variant="ghost" className="w-full">
                Configure MFA (coming soon)
              </Button>
              <Separator />
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Sessions managed via BetterAuth.</p>
                <p>Signed in as {session?.user?.email ?? "guest@example.com"}.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Integrations</CardTitle>
              <CardDescription>Manage data sync with external providers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
                <div>
                  <p className="font-medium">Supabase</p>
                  <p className="text-sm text-muted-foreground">Storage and database for topology assets.</p>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
                <div>
                  <p className="font-medium">BetterAuth</p>
                  <p className="text-sm text-muted-foreground">Secure authentication and session management.</p>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
              <Button variant="outline" className="w-full">
                Add integration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

