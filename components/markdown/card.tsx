import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export function Card({
  title,
  description,
  icon,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-colors dark:border-white/10",
        className,
      )}
      {...props}
    >
      {(title || description || icon) && (
        <div className="mb-4 flex items-start gap-3">
          {icon ? <div className="text-2xl text-primary">{icon}</div> : null}
          <div>
            {title ? (
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      )}
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4
}

export function CardGrid({
  columns = 2,
  className,
  ...props
}: CardGridProps) {
  const columnClass: Record<NonNullable<CardGridProps["columns"]>, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-4",
  }

  return (
    <div
      className={cn("grid gap-4", columnClass[columns], className)}
      {...props}
    />
  )
}
