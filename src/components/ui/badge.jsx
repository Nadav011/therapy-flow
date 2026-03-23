import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#7C9070] text-white shadow-sm hover:bg-[#6a7a60]",
        secondary:
          "border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80",
        outline: "text-slate-700 border-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
