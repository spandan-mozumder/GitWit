"use client";
import { UserButton } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ModeToggle } from "../components/ThemeToggle";
import { usePathname } from "next/navigation";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";
import { useGlobalKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
type Props = {
  children: React.ReactNode;
};
const userButtonAppearance = {
  elements: {
    userButtonAvatarBox: "w-9 h-9",
    userButtonPopoverCard: "w-auto",
  },
};
const SideBarLayout = ({ children }: Props) => {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  useGlobalKeyboardShortcuts();
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 150);
    return () => clearTimeout(timer);
  }, [pathname]);
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full m-2 ">
        <div className="flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4">
          <SidebarTrigger />
          <div className="ml-auto"></div>
          <KeyboardShortcutsModal />
          <ModeToggle />
          <UserButton appearance={userButtonAppearance} />
        </div>
        <div className="h-4"></div>
        <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
          <div
            className={`page-transition ${isTransitioning ? "page-transitioning" : ""}`}
          >
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};
export default SideBarLayout;
