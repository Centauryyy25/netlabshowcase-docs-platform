import * as React from "react"
import Link, { LinkProps } from "next/link"

import { cn } from "@/lib/utils"

type RoutedLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>

const RoutedLink = React.forwardRef<HTMLAnchorElement, RoutedLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={cn(
          "font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline",
          className,
        )}
        {...props}
      >
        {children}
      </Link>
    )
  },
)

RoutedLink.displayName = "RoutedLink"

export default RoutedLink
