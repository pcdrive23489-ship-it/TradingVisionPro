
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, BookText, Menu, LayoutDashboard, CandlestickChart, Target, Sheet, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "../ui/sidebar";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookText },
  { href: "/records", label: "Records", icon: Trophy },
  { href: "/analysis",label: "Analysis", icon: BarChart2 },
];

export function BottomNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="grid h-16 grid-cols-5 items-stretch">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href === '/' ? pathname === '/' : true)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
            onClick={() => setOpenMobile(true)}
            className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
            <Menu className="h-5 w-5" />
            <span className="truncate">More</span>
        </button>
      </div>
    </div>
  );
}
