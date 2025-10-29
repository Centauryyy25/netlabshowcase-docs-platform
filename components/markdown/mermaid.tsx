import * as React from "react"

import { cn } from "@/lib/utils"

interface MermaidProps extends React.HTMLAttributes<HTMLPreElement> {
  chart: string
}

export default function Mermaid({ chart, className, ...props }: MermaidProps) {
  return (
    <pre
      className={cn(
        "whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-sm text-muted-foreground dark:border-white/10",
        className,
      )}
      {...props}
    >
      {chart}
    </pre>
  )
}
