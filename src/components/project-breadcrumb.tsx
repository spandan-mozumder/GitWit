"use client"

import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import useProject from "~/hooks/use-project"

export function ProjectBreadcrumb() {
  const pathname = usePathname()
  const { project } = useProject()

  // Parse the pathname to generate breadcrumbs
  const segments = pathname.split('/').filter(Boolean)
  
  // Don't show breadcrumbs on main pages
  if (segments.length <= 1) return null

  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`
    
    // Format the segment name
    let label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Replace project ID with project name
    if (segment === project?.id) {
      label = project.name
    }

    return {
      label,
      path,
      isLast: index === segments.length - 1
    }
  })

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.path}>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.path}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
