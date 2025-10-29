import * as React from "react"

import { cn } from "@/lib/utils"

interface BaseProps {
  icon?: React.ReactNode
}

export interface FolderProps
  extends React.DetailsHTMLAttributes<HTMLDetailsElement>,
    BaseProps {
  name: string
  initiallyOpen?: boolean
}

export function Folder({
  name,
  children,
  className,
  icon,
  initiallyOpen = true,
  ...props
}: FolderProps) {
  return (
    <details
      open={initiallyOpen}
      className={cn("group space-y-2 text-sm", className)}
      {...props}
    >
      <summary className="flex cursor-pointer select-none items-center gap-2 text-foreground">
        <span>{icon ?? "[dir]"}</span>
        <span className="font-medium">{name}</span>
      </summary>
      <div className="ml-4 border-l border-border/40 pl-4 text-muted-foreground dark:border-white/10">
        <div className="space-y-2 py-1">{children}</div>
      </div>
    </details>
  )
}

export interface FileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    BaseProps {
  name: string
  href?: string
}

export function File({
  name,
  href,
  icon,
  className,
  children,
  ...props
}: FileProps) {
  const content = (
    <span className="flex items-center gap-2">
      <span>{icon ?? "[file]"}</span>
      <span>{name}</span>
      {children ? <span className="text-xs text-muted-foreground">{children}</span> : null}
    </span>
  )

  const baseClass = cn(
    "flex items-center gap-2 pl-6 text-sm text-muted-foreground transition-colors hover:text-foreground",
    className,
  )

  if (href) {
    return (
      <a href={href} className={baseClass}>
        {content}
      </a>
    )
  }

  return (
    <div className={baseClass} {...props}>
      {content}
    </div>
  )
}
