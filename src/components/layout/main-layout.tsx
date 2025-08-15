"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { BottomNav } from "./bottom-nav"
import { AddTradeDialog } from "../journal/add-trade-dialog"
import { Button } from "../ui/button"
import { Plus } from "lucide-react"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  if (isMobile === undefined) {
    return null; // or a loading skeleton
  }

  if (isMobile) {
    return (
      <div className="pb-16">
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
          <h1 className="text-lg font-semibold">TradeVision</h1>
          <div>{/* Right side header content for mobile */}</div>
        </header>
        <main className="pt-16">{children}</main>
        <BottomNav />
        <div className="fixed bottom-20 right-4 z-50">
          <AddTradeDialog>
             <Button size="icon" className="w-14 h-14 rounded-full shadow-lg">
                <Plus className="w-6 h-6" />
                <span className="sr-only">Log Trade</span>
             </Button>
          </AddTradeDialog>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
            <header className="sticky top-0 z-30 flex items-center gap-4 border-b p-4 bg-background/80 backdrop-blur-sm">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            </header>
            <main className="p-4 lg:p-6">{children}</main>
        </SidebarInset>
        <div className="fixed bottom-8 right-8 z-50">
           <AddTradeDialog>
             <Button size="icon" className="w-14 h-14 rounded-full shadow-lg">
                <Plus className="w-6 h-6" />
                <span className="sr-only">Log Trade</span>
             </Button>
          </AddTradeDialog>
        </div>
      </div>
    </SidebarProvider>
  )
}
