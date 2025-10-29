import * as React from "react"

import { cn } from "@/lib/utils"

type NoteVariant = "info" | "success" | "warning" | "danger"

interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  variant?: NoteVariant
}

const variantStyles: Record<NoteVariant, string> = {
  info: "border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-100",
  success:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
  warning:
    "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  danger:
    "border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-100",
}

export default function Note({
  title,
  variant = "info",
  className,
  children,
  ...props
}: NoteProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm shadow-sm",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-2 space-y-2 leading-relaxed" : undefined}>
        {children}
      </div>
    </div>
  )
}
