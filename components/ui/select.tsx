"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

// Root
function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />
}

// Group
function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group {...props} />
}

// Value
function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />
}

// 💠 Trigger (modern & elegant)
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      suppressHydrationWarning
      data-size={size}
      className={cn(
        // Base glass design
        "relative flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/10 backdrop-blur-md px-3 py-2 text-sm text-foreground/90 shadow-sm transition-all duration-300 ease-in-out outline-none",
        // Hover & focus glow
        "hover:bg-white/20 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] focus-visible:ring-2 focus-visible:ring-cyan-400/60 dark:hover:bg-neutral-800/50",
        // Mobile responsive sizing
        "sm:w-fit sm:rounded-lg sm:px-3 sm:py-2 data-[size=sm]:h-8 data-[size=default]:h-10",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2 font-medium">
        {children}
      </span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-70 transition-transform duration-300 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>

      {/* Subtle gradient glow line */}
      <span className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-50" />
    </SelectPrimitive.Trigger>
  )
}

// 💫 Dropdown / Content
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          // Floating layer
          "z-[10000] w-[90vw] sm:w-auto origin-[var(--radix-select-content-transform-origin)] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl shadow-2xl dark:from-neutral-900/70 dark:to-neutral-900/40",
          // Animation
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "transition-all duration-200 ease-out",
          // Scrollable & safe area
          "max-h-[var(--radix-select-content-available-height)] overscroll-contain",
          className
        )}
        position={position}
        sideOffset={8}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="p-2 sm:p-1">
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

// 🩶 Label
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn("px-3 py-1 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide", className)}
      {...props}
    />
  )
}

// 🌈 Item (each option)
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/90 transition-all ease-out",
        "hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/10 focus:bg-cyan-500/20 focus:text-white",
        "data-[state=checked]:bg-cyan-500/15 data-[state=checked]:text-cyan-400",
        "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span className="absolute right-3 flex h-4 w-4 items-center justify-center text-cyan-400">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

// 🩵 Separator
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("my-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent", className)}
      {...props}
    />
  )
}

// 🧭 Scroll buttons
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn("flex items-center justify-center py-2 text-muted-foreground/70", className)}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn("flex items-center justify-center py-2 text-muted-foreground/70", className)}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
