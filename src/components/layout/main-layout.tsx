
"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { BottomNav } from "./bottom-nav"
import { AddTradeDialog } from "../journal/add-trade-dialog"
import { Button } from "../ui/button"
import { Plus } from "lucide-react"
import { ProtectedRoute } from "@/context/auth-provider"

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  const [headerTitle, setHeaderTitle] = React.useState("Dashboard");

  // A bit of a hack to get the page title from the page's h1
  React.useEffect(() => {
    // On client-side, find the h1 and set it as the header title
    const h1 = document.querySelector('h1');
    if (h1?.textContent) {
      setHeaderTitle(h1.textContent);
    }
  }, [children]);


  if (isMobile === undefined) {
    return null; // or a loading skeleton
  }

  if (isMobile) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <div className="pb-24">
          <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm h-16">
            <h1 className="text-lg font-semibold">{headerTitle}</h1>
            <div className="flex items-center gap-2">
              <AddTradeDialog>
                  <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Log Trade
                  </Button>
              </AddTradeDialog>
            </div>
          </header>
          <main className="p-4 pt-20">{children}</main>
          <BottomNav />
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex-1">
            <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b p-4 bg-background/95 backdrop-blur-sm h-16">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-semibold tracking-tight">{headerTitle}</h1>
              </div>
              <AddTradeDialog>
                 <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Log New Trade
                 </Button>
              </AddTradeDialog>
            </header>
            <main className="p-4 lg:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}


export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <MainLayoutContent>
                {children}
            </MainLayoutContent>
        </ProtectedRoute>
    )
}
