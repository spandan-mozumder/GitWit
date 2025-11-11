import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-300 overflow-hidden border-2 shadow-md hover:shadow-lg hover:scale-105",
  {
    variants: {
      variant: {
        default: [
          "border-primary/30 bg-gradient-to-r from-primary to-primary/80",
          "text-primary-foreground",
          "shadow-primary/20",
          "[a&]:hover:shadow-primary/30",
          "[a&]:hover:from-primary/90 [a&]:hover:to-primary/70",
        ],
        secondary: [
          "border-secondary/30 bg-gradient-to-r from-secondary to-secondary/80",
          "text-secondary-foreground",
          "shadow-secondary/20",
          "[a&]:hover:shadow-secondary/30",
          "[a&]:hover:from-secondary/90 [a&]:hover:to-secondary/70",
        ],
        destructive: [
          "border-destructive/30 bg-gradient-to-r from-destructive to-destructive/80",
          "text-destructive-foreground",
          "shadow-destructive/25",
          "[a&]:hover:shadow-destructive/35",
          "[a&]:hover:from-destructive/90 [a&]:hover:to-destructive/70",
        ],
        outline: [
          "border-border/50 bg-background/50 backdrop-blur-sm",
          "text-foreground",
          "[a&]:hover:bg-accent/60",
          "[a&]:hover:border-primary/30",
          "[a&]:hover:text-accent-foreground",
        ],
        success: [
          "border-green-500/30 bg-gradient-to-r from-green-500 to-green-600",
          "text-white",
          "shadow-green-500/20",
          "[a&]:hover:shadow-green-500/30",
        ],
        warning: [
          "border-yellow-500/30 bg-gradient-to-r from-yellow-500 to-yellow-600",
          "text-white",
          "shadow-yellow-500/20",
          "[a&]:hover:shadow-yellow-500/30",
        ],
        info: [
          "border-blue-500/30 bg-gradient-to-r from-blue-500 to-blue-600",
          "text-white",
          "shadow-blue-500/20",
          "[a&]:hover:shadow-blue-500/30",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}
export { Badge, badgeVariants };
