// src/components/ui/checkbox.tsx
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Base (unchecked) state
        "peer inline-flex items-center justify-center",
        "size-5 shrink-0 rounded-sm", // 20x20, radius-sm
        "border border-[#D5D7DA] bg-white", // neutral border, white bg
        "text-white transition-colors",
        // Checked state
        "data-[state=checked]:bg-[#C12116] data-[state=checked]:border-[#C12116]",
        // Focus / accessibility
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C12116]/30",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }