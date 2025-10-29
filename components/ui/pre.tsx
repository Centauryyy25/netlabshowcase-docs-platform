import * as React from "react"

import { cn } from "@/lib/utils"

const Pre = React.forwardRef<HTMLPreElement, React.HTMLAttributes<HTMLPreElement>>(
  ({ className, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          "relative overflow-x-auto rounded-lg border border-border/60 bg-muted p-4 font-mono text-sm shadow-sm dark:border-white/10",
          className,
        )}
        {...props}
      />
    )
  },
)

Pre.displayName = "Pre"

export default Pre
