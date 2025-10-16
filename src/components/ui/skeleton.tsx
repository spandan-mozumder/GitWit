import { cn } from "@/lib/utils"
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gradient-to-r from-accent via-accent/50 to-accent animate-shimmer-slide rounded-xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] before:animate-shimmer-slide", className)}
      {...props}
    />
  )
}
export { Skeleton }
