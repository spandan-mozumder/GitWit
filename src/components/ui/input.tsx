import * as React from "react"
import { cn } from "@/lib/utils"
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground",
        "h-11 w-full min-w-0 rounded-xl border-2 border-border/50",
        "bg-background/50 backdrop-blur-sm",
        "px-4 py-2.5 text-base",
        "shadow-md shadow-black/5",
        "transition-all duration-300",
        "outline-none",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "focus:border-primary focus:shadow-xl focus:shadow-primary/10",
        "focus:ring-4 focus:ring-primary/10",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:mr-4",
        "aria-invalid:border-destructive/50 aria-invalid:ring-4 aria-invalid:ring-destructive/10",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}
export { Input }
