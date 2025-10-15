import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/10 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-background/50 flex field-sizing-content min-h-24 w-full rounded-xl border-2 backdrop-blur-sm px-4 py-3 text-base shadow-md hover:shadow-lg hover:border-primary/30 hover:shadow-primary/5 focus:shadow-xl focus:shadow-primary/10 transition-all duration-300 outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
