"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { useSession, getSession } from "@/lib/auth-client"
import { SignInPrompt } from "@/components/auth/SignInPrompt"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Loader2, MonitorSmartphone, Moon, Plug, Shield, ShieldCheck, Sun } from "lucide-react"

const themeOptions = [
  {
    value: "system" as const,
    label: "System",
    description: "Follow your device appearance",
    icon: MonitorSmartphone,
  },
  {
    value: "light" as const,
    label: "Light",
    description: "Bright, minimal interface",
    icon: Sun,
  },
  {
    value: "dark" as const,
    label: "Dark",
    description: "High contrast for low light",
    icon: Moon,
  },
]

type ThemePreference = "system" | "light" | "dark"

type SettingsResponse = {
  profile: {
    name: string
    email: string
    image: string | null
  }
  preferences: {
    theme: ThemePreference
    labUpdates: boolean
    digestEmails: boolean
    supabaseConnected: boolean
    betterAuthConnected: boolean
  }
}

type PreferencesState = {
  theme: ThemePreference
  labUpdates: boolean
  digestEmails: boolean
  supabaseConnected: boolean
  betterAuthConnected: boolean
}

export default function SettingsPage() {
  const { data: session, isPending } = useSession()
  const { setTheme } = useTheme()
  const isAuthenticated = Boolean(session?.user)

  const [initializing, setInitializing] = useState(true)

  const [profileName, setProfileName] = useState("")
  const [profileEmail, setProfileEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [initialProfile, setInitialProfile] = useState<{ name: string; image: string } | null>(null)

  const [themePreference, setThemePreference] = useState<ThemePreference>("system")
  const [labUpdates, setLabUpdates] = useState(true)
  const [digestEmails, setDigestEmails] = useState(false)
  const [supabaseConnected, setSupabaseConnected] = useState(true)
  const [betterAuthConnected, setBetterAuthConnected] = useState(true)
  const [initialPreferences, setInitialPreferences] = useState<PreferencesState | null>(null)

  const [profileSaving, setProfileSaving] = useState(false)
  const [preferencesSaving, setPreferencesSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [integrationSaving, setIntegrationSaving] = useState<"supabase" | "betterAuth" | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false)

  useEffect(() => {
    let aborted = false

    const fetchSettings = async () => {
      try {
        if (!isAuthenticated) {
          setInitializing(false)
          return
        }

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error ?? "Unable to load settings")
        }

        const data = (await response.json()) as SettingsResponse

        if (aborted) return

        const resolvedProfileName = data.profile?.name ?? session?.user?.name ?? ""
        const resolvedEmail = data.profile?.email ?? session?.user?.email ?? ""
        const resolvedAvatar = data.profile?.image ?? ""

        setProfileName(resolvedProfileName)
        setProfileEmail(resolvedEmail)
        setAvatarUrl(resolvedAvatar)
        setInitialProfile({ name: resolvedProfileName, image: resolvedAvatar })

        const resolvedPreferences: PreferencesState = {
          theme: data.preferences?.theme ?? "system",
          labUpdates: data.preferences?.labUpdates ?? true,
          digestEmails: data.preferences?.digestEmails ?? false,
          supabaseConnected: data.preferences?.supabaseConnected ?? true,
          betterAuthConnected: data.preferences?.betterAuthConnected ?? true,
        }

        setThemePreference(resolvedPreferences.theme)
        setLabUpdates(resolvedPreferences.labUpdates)
        setDigestEmails(resolvedPreferences.digestEmails)
        setSupabaseConnected(resolvedPreferences.supabaseConnected)
        setBetterAuthConnected(resolvedPreferences.betterAuthConnected)
        setInitialPreferences(resolvedPreferences)
      } catch (error) {
        console.error(error)
        toast.error(
          error instanceof Error ? error.message : "Unable to load settings",
        )
      } finally {
        if (!aborted) {
          setInitializing(false)
        }
      }
    }

    fetchSettings()

    return () => {
      aborted = true
    }
  }, [isAuthenticated, session?.user?.email, session?.user?.image, session?.user?.name])

  useEffect(() => {
    if (!initializing) {
      setTheme(themePreference)
    }
  }, [initializing, setTheme, themePreference])

  const profileHasChanges = useMemo(() => {
    if (!initialProfile) return false
    const trimmedName = profileName.trim()
    const trimmedAvatar = avatarUrl.trim()
    return (
      trimmedName !== initialProfile.name.trim() ||
      trimmedAvatar !== (initialProfile.image?.trim() ?? "")
    )
  }, [avatarUrl, initialProfile, profileName])

  const preferencesChanged = useMemo(() => {
    if (!initialPreferences) return false
    return (
      initialPreferences.theme !== themePreference ||
      initialPreferences.labUpdates !== labUpdates ||
      initialPreferences.digestEmails !== digestEmails
    )
  }, [digestEmails, initialPreferences, labUpdates, themePreference])

  const persistPreferences = async (payload: Partial<PreferencesState>) => {
    const response = await fetch("/api/settings/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error ?? "Unable to update preferences")
    }
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = profileName.trim()
    const trimmedAvatar = avatarUrl.trim()

    if (!trimmedName) {
      toast.error("Display name is required")
      return
    }

    setProfileSaving(true)

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          image: trimmedAvatar || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? "Unable to update profile")
      }

      toast.success("Profile updated")
      setInitialProfile({ name: trimmedName, image: trimmedAvatar })
      await getSession()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Unable to update profile")
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePreferencesSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPreferencesSaving(true)

    try {
      await persistPreferences({
        theme: themePreference,
        labUpdates,
        digestEmails,
      })

      toast.success("Preferences saved")
      setInitialPreferences((prev) =>
        prev
          ? {
              ...prev,
              theme: themePreference,
              labUpdates,
              digestEmails,
            }
          : {
              theme: themePreference,
              labUpdates,
              digestEmails,
              supabaseConnected,
              betterAuthConnected,
            },
      )
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : "Unable to save preferences",
      )
    } finally {
      setPreferencesSaving(false)
    }
  }

  const handleIntegrationToggle = async (provider: "supabase" | "betterAuth") => {
    const nextValue =
      provider === "supabase" ? !supabaseConnected : !betterAuthConnected

    if (provider === "supabase") {
      setSupabaseConnected(nextValue)
    } else {
      setBetterAuthConnected(nextValue)
    }

    setIntegrationSaving(provider)

    try {
      await persistPreferences(
        provider === "supabase"
          ? { supabaseConnected: nextValue }
          : { betterAuthConnected: nextValue },
      )

      setInitialPreferences((prev) => {
        if (!prev) return prev
        if (provider === "supabase") {
          return { ...prev, supabaseConnected: nextValue }
        }
        return { ...prev, betterAuthConnected: nextValue }
      })

      toast.success(
        `${provider === "supabase" ? "Supabase" : "BetterAuth"} ${
          nextValue ? "connected" : "disconnected"
        }.`,
      )
    } catch (error) {
      console.error(error)
      if (provider === "supabase") {
        setSupabaseConnected(!nextValue)
      } else {
        setBetterAuthConnected(!nextValue)
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update integration status",
      )
    } finally {
      setIntegrationSaving(null)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.error("Please provide your current and new password")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    setPasswordSaving(true)

    try {
      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? "Unable to change password")
      }

      toast.success("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setRevokeOtherSessions(false)
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : "Unable to change password",
      )
    } finally {
      setPasswordSaving(false)
    }
  }

  if (isPending) {
    return <SettingsSkeleton />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020618] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <SignInPrompt
            title="Sign in to manage settings"
            description="Update preferences, security options, and integrations after signing in."
            redirectTo="/settings"
          />
        </div>
      </div>
    )
  }

  if (initializing) {
    return <SettingsSkeleton />
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#050f24] dark:text-slate-100">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
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
          <h1 className="text-3xl font-semibold sm:text-4xl">Account settings</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-slate-300 sm:text-base">
            Keep your profile up to date, fine-tune notifications, and manage security for your NetLabShowcase account.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Card className="border border-slate-200/70 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
                <CardTitle className="text-lg sm:text-xl">Profile</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-slate-300 sm:text-base">
                  Update your public-facing details so collaborators recognize you instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-6 pt-0 sm:px-6">
                <form className="space-y-4" onSubmit={handleProfileSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="display-name">Display name</Label>
                    <Input
                      id="display-name"
                      value={profileName}
                      onChange={(event) => setProfileName(event.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" value={profileEmail} disabled className="bg-slate-100 text-gray-500 dark:bg-slate-800/80 dark:text-slate-400" />
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Need to change your email? Contact support so we can re-verify your identity first.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="avatar-url">Avatar URL</Label>
                    <Input
                      id="avatar-url"
                      value={avatarUrl}
                      onChange={(event) => setAvatarUrl(event.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="submit"
                      disabled={!profileHasChanges || profileSaving}
                      className="h-11 px-6"
                    >
                      {profileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save profile
                    </Button>
                    {!profileHasChanges && (
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        No unsaved changes
                      </span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/70 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
                <CardTitle className="text-lg sm:text-xl">Appearance & notifications</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-slate-300 sm:text-base">
                  Choose how NetLabShowcase looks and when we should keep you posted about activity.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-6 pt-0 sm:px-6">
                <form className="space-y-5" onSubmit={handlePreferencesSubmit}>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Theme</Label>
                    <RadioGroup
                      className="grid gap-2 sm:grid-cols-3"
                      value={themePreference}
                      onValueChange={(value: ThemePreference) => setThemePreference(value)}
                    >
                      {themeOptions.map((option) => {
                        const Icon = option.icon
                        return (
                          <Label
                            key={option.value}
                            className={`flex cursor-pointer flex-col gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-left shadow-sm transition hover:border-sky-200 dark:border-slate-700/60 dark:bg-slate-900/60 dark:hover:border-sky-400/60 ${themePreference === option.value ? "ring-2 ring-sky-500 dark:ring-sky-400" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <RadioGroupItem value={option.value} />
                              <Icon className="h-4 w-4 text-sky-500 dark:text-sky-300" />
                            </div>
                            <div>
                              <p className="font-medium">{option.label}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">{option.description}</p>
                            </div>
                          </Label>
                        )
                      })}
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60 dark:bg-slate-900/60">
                      <div className="space-y-1">
                        <p className="font-medium">Lab updates</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          Get notified when collaborators publish or edit shared labs.
                        </p>
                      </div>
                      <Switch checked={labUpdates} onCheckedChange={setLabUpdates} />
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60 dark:bg-slate-900/60">
                      <div className="space-y-1">
                        <p className="font-medium">Weekly AI digest</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          Receive a summary email with AI-generated tips based on your labs.
                        </p>
                      </div>
                      <Switch checked={digestEmails} onCheckedChange={setDigestEmails} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button type="submit" disabled={!preferencesChanged || preferencesSaving} className="h-11 px-6">
                      {preferencesSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save preferences
                    </Button>
                    {!preferencesChanged && (
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        Preferences are up to date
                      </span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/70 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
                <CardTitle className="text-lg sm:text-xl">Change password</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-slate-300 sm:text-base">
                  For security, provide your current password before setting a new one. We will never ask you for it via email.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-6 pt-0 sm:px-6">
                <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      autoComplete="current-password"
                      placeholder="currentPassword"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">New password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="Minimum 8 characters"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm new password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
                    <div className="space-y-1">
                      <p className="font-medium">Sign out other devices</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Optional: revoke every session except this one after the password change.
                      </p>
                    </div>
                    <Switch checked={revokeOtherSessions} onCheckedChange={setRevokeOtherSessions} />
                  </div>
                  <Button type="submit" disabled={passwordSaving} className="h-11 px-6">
                    {passwordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-slate-200/70 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
                <CardTitle className="text-lg sm:text-xl">Security overview</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-slate-300 sm:text-base">
                  Quick view of how your account is protected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-6 pt-0 sm:px-6">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
                  <ShieldCheck className="h-10 w-10 text-sky-500 dark:text-sky-300" />
                  <div className="space-y-1">
                    <p className="font-medium">Active session</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Signed in as {profileEmail || session?.user?.email || "unknown"}.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                      We refresh sessions automatically after profile updates.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
                  <Shield className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                  <div className="space-y-1">
                    <p className="font-medium">Two-factor authentication</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      SMS and authenticator support are on our roadmap. Stay tuned!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/70 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
                <CardTitle className="text-lg sm:text-xl">Connected integrations</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-slate-300 sm:text-base">
                  Control which services can access your lab data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-6 pt-0 sm:px-6">
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60 dark:bg-slate-900/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Plug className="h-4 w-4 text-sky-500 dark:text-sky-300" />
                      <p className="font-medium">Supabase</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Storage and database for topology assets.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={supabaseConnected ? "secondary" : "outline"}>
                      {supabaseConnected ? "Connected" : "Disconnected"}
                    </Badge>
                    <Button
                      type="button"
                      variant={supabaseConnected ? "outline" : "default"}
                      className="h-10"
                      disabled={integrationSaving === "supabase"}
                      onClick={() => handleIntegrationToggle("supabase")}
                    >
                      {integrationSaving === "supabase" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {supabaseConnected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60 dark:bg-slate-900/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Plug className="h-4 w-4 text-sky-500 dark:text-sky-300" />
                      <p className="font-medium">BetterAuth</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Authentication, sessions, and secure password management.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={betterAuthConnected ? "secondary" : "outline"}>
                      {betterAuthConnected ? "Connected" : "Disconnected"}
                    </Badge>
                    <Button
                      type="button"
                      variant={betterAuthConnected ? "outline" : "default"}
                      className="h-10"
                      disabled={integrationSaving === "betterAuth"}
                      onClick={() => handleIntegrationToggle("betterAuth")}
                    >
                      {integrationSaving === "betterAuth" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {betterAuthConnected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#050f24] dark:text-slate-100">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
