
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart2, BookText, CandlestickChart, Clock, LayoutDashboard, Settings, Database, Target, Save, Trophy, LogOut } from "lucide-react"

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
import { useAuth } from "@/context/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookText },
  { href: "/analysis", label: "Analysis", icon: BarChart2 },
  { href: "/sessions", label: "Sessions", icon: Clock },
  { href: "/market", label: "Market", icon: CandlestickChart },
  { href: "/records", label: "Records", icon: Trophy },
  { href: "/planner", label: "Planner", icon: Target },
  { href: "/planner-master-data", label: "Planner Data", icon: Save },
  { href: "/master-data", label: "Master Data", icon: Database },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      })
    } catch (error) {
        toast({
            title: "Logout Failed",
            description: "Could not log you out. Please try again.",
            variant: "destructive"
        })
    }
  }


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <h1 className="text-xl font-semibold">TradeVision</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href === '/' ? pathname === '/' : true)}
                icon={<item.icon />}
                tooltip={item.label}
                onClick={() => setOpenMobile(false)}
              >
                <Link href={item.href}>
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-3">
             <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL || undefined} alt="User avatar" />
                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.email}</p>
            </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton icon={<Settings />} tooltip="Settings">
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
             <SidebarMenuButton icon={<LogOut />} tooltip="Logout" onClick={handleLogout}>
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
