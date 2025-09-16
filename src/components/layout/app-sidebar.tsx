
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, BookText, Clock, LayoutDashboard, Database, Target, Save, Trophy } from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/icons"
import { ThemeToggle } from "../theme-toggle"

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/journal-list", label: "Journal", icon: BookText },
  { href: "/analysis", label: "Analysis", icon: BarChart2 },
  { href: "/sessions", label: "Sessions", icon: Clock },
  { href: "/records", label: "Records", icon: Trophy },
  { href: "/planner", label: "Planner", icon: Target },
  { href: "/planner-master-data", label: "Planner Data", icon: Save },
  { href: "/master-data", label: "Master Data", icon: Database },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar();

  const isJournalActive = pathname === '/journal' || pathname === '/journal-list';

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <h1 className="text-xl font-semibold">TradeVision</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            let isActive = false;
            if (item.label === 'Journal') {
                isActive = isJournalActive;
            } else {
                isActive = pathname.startsWith(item.href) && (item.href === '/' ? pathname === '/' : true);
            }
            
            return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    icon={<item.icon />}
                    tooltip={item.label}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link href={item.href}>
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
