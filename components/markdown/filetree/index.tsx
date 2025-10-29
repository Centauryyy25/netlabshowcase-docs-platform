import * as React from "react"

import { cn } from "@/lib/utils"

export type FileTreeProps = React.HTMLAttributes<HTMLDivElement>

export function FileTree({ className, ...props }: FileTreeProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/60 bg-muted/30 p-4 font-mono text-sm dark:border-white/10",
        className,
      )}
      {...props}
    />
  )
}

export default FileTree
