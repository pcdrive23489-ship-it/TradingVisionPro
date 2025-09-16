
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, BookText, Menu, LayoutDashboard, CandlestickChart, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "../ui/sidebar";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/journal-list", label: "Journal", icon: BookText },
  { href: "/market", label: "Market", icon: CandlestickChart },
  { href: "/analysis",label: "Analysis", icon: BarChart2 },
];

export function BottomNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const isJournalActive = pathname === '/journal' || pathname === '/journal-list';

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[95%] -translate-x-1/2 rounded-2xl border border-white/30 bg-white/20 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-black/20">
      <div className="grid h-16 grid-cols-5 items-stretch">
        {menuItems.map((item) => {
          let isActive = false;
          if(item.label === 'Journal') {
              isActive = isJournalActive;
          } else {
              isActive = pathname.startsWith(item.href) && (item.href === '/' ? pathname === '/' : true)
          }

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
