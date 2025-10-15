"use client"

import { 
    Bot, 
    CreditCard, 
    LayoutDashboard, 
    Plus, 
    Presentation, 
    BarChart3, 
    Code2, 
    MessageSquare, 
    BookOpen, 
    CheckSquare,
    Sparkles
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "~/components/ui/sidebar"
import { cn } from "~/lib/utils"
import useProject from "~/hooks/use-project"
import { Badge } from "~/components/ui/badge"

export function AppSidebar(){
    const router = useRouter();
    const pathname = usePathname();
    const {open} = useSidebar();
    const {projects, projectId, setProjectId}= useProject();
    
    const mainItems = [{
        title:"Dashboard",
        url:"/dashboard",
        icon:LayoutDashboard,
        description: "Project overview"
    },{
        title:"Features",
        url:"/features",
        icon:Sparkles,
        description: "Explore all features"
    },{
        title:"Q&A",
        url:"/qa",
        icon:Bot,
        description: "Ask questions about your code"
    },{
        title:"Meetings",
        url:"/meetings",
        icon:Presentation,
        description: "Meeting transcripts & summaries"
    },{
        title:"Billing",
        url:"/billing",
        icon:CreditCard,
        description: "Manage subscription"
    }];

    const projectFeatures = [{
        title:"Analytics",
        url:`/dashboard/${projectId}/analytics`,
        icon:BarChart3,
        badge: "New",
        description: "Team metrics & DORA"
    },{
        title:"Code Review",
        url:`/dashboard/${projectId}/code-review`,
        icon:Code2,
        badge: "AI",
        description: "AI-powered analysis"
    },{
        title:"Team Chat",
        url:`/dashboard/${projectId}/team-chat`,
        icon:MessageSquare,
        badge: "Live",
        description: "Real-time collaboration"
    }]

    return (
        <Sidebar collapsible="icon" variant="floating" >
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <img src={'/favicon.ico'} alt="logo" className="size-8" />
                    {open && <h1 className="text-xl font-semibold tracking-[0.3em] text-primary/80">GITWIT</h1>}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu> 

                            {mainItems.map((item)=>{
                                return(
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                '!bg-primary !text-white': pathname === item.url
                                            })} title={item.description}>
                                                <item.icon className="size-4"/>
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                            
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {projectId && (
                    <SidebarGroup>
                        <SidebarGroupLabel>
                            Project Features
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu> 
                                {projectFeatures.map((item)=>{
                                    return(
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <Link href={item.url} className={cn("group relative", {
                                                    '!bg-primary !text-white': pathname.includes(item.url)
                                                })} title={item.description}>
                                                    <item.icon className="size-4"/>
                                                    <span className="flex-1">{item.title}</span>
                                                    {item.badge && open && (
                                                        <Badge variant="secondary" className={cn(
                                                            "ml-auto text-[10px] px-1.5 py-0 h-4",
                                                            pathname.includes(item.url) && "bg-white/20 text-white"
                                                        )}>
                                                            {item.badge}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                <SidebarGroup>
                    <SidebarGroupLabel>
                        Your Projects
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu> 

                            {projects?.map((project: { id: string; name: string })=>{
                                return(
                                    <SidebarMenuItem key={project.name}>
                                        <SidebarMenuButton asChild>
                                            <div onClick={()=>{
                                                setProjectId(project.id);
                                                if (pathname !== '/dashboard') {
                                                    router.push('/dashboard');
                                                }
                                            }} className={cn("cursor-pointer", {
                                                "bg-primary/20": project.id === projectId
                                            })}>
                                                <div className={cn(
                                                    'rounded-sm border size-6 -ml-1 flex items-center justify-center text-sm bg-white text-primary',
                                                    {
                                                        'bg-primary text-white': project.id === projectId
                                                    }
                                                )}>
                                                    <span className="p-3">{project.name[0]}</span>
                                                </div>
                                                    <span>{project.name}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                            <div className="h-2"></div>
                           { open && <SidebarMenuItem>
                                <Link href={'/create'}>
                                    <Button size={"sm"} variant="outline" className="w-fit px-2">
                                        <Plus/>
                                       Create Project
                                    </Button>
                                </Link>
                            </SidebarMenuItem>}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                
            </SidebarContent>
        </Sidebar>
    )
}