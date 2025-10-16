import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold tracking-wide transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none overflow-hidden isolate",
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-br from-primary via-primary to-primary/80",
          "text-primary-foreground",
          "shadow-lg shadow-primary/25",
          "hover:shadow-xl hover:shadow-primary/30",
          "hover:scale-[1.02]",
          "active:scale-[0.98]",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100",
          "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/10 after:to-transparent after:opacity-0 hover:after:opacity-100",
          "border border-primary/20",
        ],
        destructive: [
          "bg-gradient-to-br from-destructive via-destructive to-destructive/80",
          "text-destructive-foreground",
          "shadow-lg shadow-destructive/25",
          "hover:shadow-xl hover:shadow-destructive/35",
          "hover:scale-[1.02]",
          "active:scale-[0.98]",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100",
          "border border-destructive/30",
        ],
        outline: [
          "border-2 border-border/60",
          "bg-background/50 backdrop-blur-sm",
          "hover:bg-accent/50",
          "hover:border-primary/40",
          "hover:shadow-md",
          "text-foreground",
          "transition-all duration-300",
          "hover:scale-[1.01]",
        ],
        secondary: [
          "bg-gradient-to-br from-secondary via-secondary to-secondary/90",
          "text-secondary-foreground",
          "shadow-md shadow-secondary/20",
          "hover:shadow-lg hover:shadow-secondary/25",
          "hover:scale-[1.01]",
          "border border-secondary/30",
        ],
        ghost: [
          "hover:bg-accent/70",
          "hover:text-accent-foreground",
          "hover:backdrop-blur-sm",
          "transition-all duration-200",
          "hover:shadow-sm",
        ],
        link: [
          "text-primary",
          "underline-offset-4",
          "hover:underline",
          "relative",
          "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full",
        ],
        gradient: [
          "bg-gradient-to-r from-primary via-primary/80 to-secondary",
          "text-primary-foreground",
          "shadow-xl shadow-primary/30",
          "hover:shadow-2xl hover:shadow-primary/40",
          "hover:scale-[1.03]",
          "active:scale-[0.98]",
          "animate-gradient",
          "bg-[length:200%_auto]",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        ],
        glass: [
          "bg-white/10 dark:bg-black/10",
          "backdrop-blur-xl",
          "border border-white/20 dark:border-white/10",
          "text-foreground",
          "shadow-xl shadow-black/5",
          "hover:bg-white/20 dark:hover:bg-black/20",
          "hover:border-white/30 dark:hover:border-white/20",
          "hover:shadow-2xl",
        ],
      },
      size: {
        default: "h-10 px-5 py-2.5 rounded-xl has-[>svg]:px-4",
        sm: "h-8 rounded-lg gap-1.5 px-3.5 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-2xl px-8 text-base has-[>svg]:px-6",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-2xl",
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
  variant,
  size,
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
export { Button, buttonVariants }
