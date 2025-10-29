import * as React from "react"

import { cn } from "@/lib/utils"

export type StepProps = React.OlHTMLAttributes<HTMLOListElement>

export function Step({ className, ...props }: StepProps) {
  return (
    <ol
      className={cn(
        "space-y-4 border-l border-border/40 pl-4 text-sm dark:border-white/10",
        className,
      )}
      {...props}
    />
  )
}

export interface StepItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  title?: string
}

export function StepItem({
  title,
  children,
  className,
  ...props
}: StepItemProps) {
  return (
    <li
      className={cn(
        "relative ml-4 rounded-lg border border-border/60 bg-card p-4 shadow-sm before:absolute before:-left-[1.65rem] before:top-3 before:h-3 before:w-3 before:rounded-full before:border before:border-border/60 before:bg-card dark:border-white/10",
        className,
      )}
      {...props}
    >
      {title ? (
        <p className="text-base font-semibold text-foreground">{title}</p>
      ) : null}
      <div className={title ? "mt-2 space-y-2 text-muted-foreground" : undefined}>
        {children}
      </div>
    </li>
  )
}
