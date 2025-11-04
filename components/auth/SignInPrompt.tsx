"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type SignInPromptProps = {
  title?: string
  description?: string
  redirectTo?: string
  className?: string
}

export function SignInPrompt({
  title = "Sign in required",
  description = "You need an active account to access this area.",
  redirectTo,
  className,
}: SignInPromptProps) {
  const signInHref = redirectTo
    ? `/sign-in?redirect=${encodeURIComponent(redirectTo)}`
    : "/sign-in"

  return (
    <Card className={className ?? "mx-auto w-full max-w-lg"}>
      <CardHeader className="space-y-2 px-4 py-4 sm:px-6 sm:py-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 pb-5 pt-0 sm:flex-row sm:px-6">
        <Button asChild className="h-11 w-full sm:w-auto">
          <Link href={signInHref}>Sign In</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
          <Link href="/sign-up">Create Account</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
