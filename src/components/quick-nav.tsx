"use client"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { BarChart3, Code2, MessageSquare } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
export function QuickNav() {
  const params = useParams<{ projectId: string }>()
  const pathname = usePathname()
  if (!params.projectId) return null
  const navItems = [
    {
      label: "Analytics",
      href: `/dashboard/${params.projectId}/analytics`,
      icon: BarChart3,
    },
    {
      label: "Code Review",
      href: `/dashboard/${params.projectId}/code-review`,
      icon: Code2,
    },
    {
      label: "Team Chat",
      href: `/dashboard/${params.projectId}/team-chat`,
      icon: MessageSquare,
    },
  ]
  return (
    <div className="flex items-center gap-2 p-1 rounded-xl border border-border/70 bg-card/50 backdrop-blur-sm w-fit">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2 transition-all",
                isActive && "bg-primary text-white hover:bg-primary hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        )
      })}
    </div>
  )
}
