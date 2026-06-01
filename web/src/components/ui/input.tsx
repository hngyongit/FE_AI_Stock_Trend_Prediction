import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border px-3 py-2 text-sm transition-colors outline-none bg-[#111827] text-[#F8FAFC] placeholder:text-[#94A3B8] border-[#334155] focus-visible:ring-2 focus-visible:ring-[#3B82F6]/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
