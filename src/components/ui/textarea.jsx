import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-base text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-[#7C9070] focus-visible:ring-2 focus-visible:ring-[#7C9070]/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
