"use client"
import { UserButton } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { ModeToggle } from '../components/ThemeToggle'
import { usePathname } from 'next/navigation'

type Props = {
    children: React.ReactNode
}
const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-9 h-9", // Custom width and height
      userButtonPopoverCard: "w-auto", // Custom background for the popover card
    //   userButtonPopoverActionButton: "text-blue-400", // Custom text color for action buttons
    },
  };
const SideBarLayout = ({children}:Props) => {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <SidebarProvider>
        {/* <AppSidebar /> */}
        <AppSidebar/>
        <main className='w-full m-2 '>
            <div className='flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4'>
                <SidebarTrigger />
                {/* <SearchBar/> */}
                <div className="ml-auto"></div>
                <ModeToggle/>
                <UserButton appearance={userButtonAppearance}/>
            </div>
            <div className="h-4"></div>
            {/* main content */}
            <div className='border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4'>
                <div className={`page-transition ${isTransitioning ? 'page-transitioning' : ''}`}>
                    {children}
                </div>
            </div>
        </main>
    </SidebarProvider>
  )
}

export default SideBarLayout