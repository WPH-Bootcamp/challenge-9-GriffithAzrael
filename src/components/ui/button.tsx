// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base style (berlaku untuk semua variant & size)
  "inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 " +
    "rounded-full text-base font-bold transition-colors " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 " +
    "outline-none focus-visible:outline-none",
  {
    variants: {
      variant: {
        // Primary button (Login / Register) sesuai Figma
        default: "bg-[#C12116] text-white hover:bg-[#a91b11]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Default: 48px height, full width, padding 8px
        default: "h-12 w-full px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }