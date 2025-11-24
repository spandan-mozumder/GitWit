"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted/50 text-muted-foreground inline-flex h-11 w-fit items-center justify-center rounded-xl p-1 backdrop-blur-sm border border-border/30 shadow-md",
        className,
      )}
      {...props}
    />
  );
}
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "cursor-pointer data-[state=active]:bg-background data-[state=active]:text-foreground focus-visible:border-primary focus-visible:ring-primary/10 focus-visible:outline-primary data-[state=active]:border-border/50 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/10 text-foreground/60 hover:text-foreground inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 hover:bg-background/50 focus-visible:ring-4 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:scale-[1.02] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}
export { Tabs, TabsList, TabsTrigger, TabsContent };
