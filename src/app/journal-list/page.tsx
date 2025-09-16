
"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTradeDialog } from "@/components/journal/add-trade-dialog"
import { EditTradeDialog } from "@/components/journal/edit-trade-dialog"
import MainLayout from "@/components/layout/main-layout"
import type { Trade } from "@/lib/types"
import { useTrades } from "@/context/trade-provider"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Edit, Trash2, CalendarDays, ChevronsRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { format } from "date-fns"


function TradeCard({ trade, onDelete }: { trade: Trade, onDelete: (ticket: number) => void }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const handleDelete = () => {
    onDelete(trade.ticket);
    setIsDeleteDialogOpen(false);
  }

  const isProfit = (trade.profit_usd || 0) >= 0;

  return (
    <AccordionItem value={String(trade.ticket)}>
      <AccordionTrigger>
        <div className="flex flex-1 items-center justify-between pr-4">
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg">{trade.symbol}</span>
            <Badge variant={trade.type === 'buy' ? 'outline' : 'destructive'} className={`capitalize text-xs ${trade.type === 'buy' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
              {trade.type}
            </Badge>
          </div>
          <div className="text-right">
            <p className={`font-semibold text-lg ${isProfit ? "text-accent" : "text-destructive"}`}>
              {isProfit ? '+' : ''}{(trade.profit_usd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
            <p className="text-xs text-muted-foreground">{new Date(trade.closing_time_utc).toLocaleString('en-GB')}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Entry / Exit</p>
            <p>{trade.opening_price} → {trade.closing_price}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">SL / TP</p>
            <p>{trade.stop_loss} / {trade.take_profit}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lot Size</p>
            <p>{trade.lots}</p>
          </div>
           <div>
            <p className="text-sm text-muted-foreground">Pips</p>
            <p>{(trade.pips || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Commission</p>
            <p>${(trade.commission_usd || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Session</p>
            <p>{trade.session}</p>
          </div>
           <div>
            <p className="text-sm text-muted-foreground">R:R Ratio</p>
            <p>{trade.risk_reward_ratio ? trade.risk_reward_ratio.toFixed(2) + ':1' : 'N/A'}</p>
          </div>
          {trade.notes && <div className="col-span-2 md:col-span-4"><p className="text-sm text-muted-foreground">Notes</p><p>{trade.notes}</p></div>}
          {trade.mistakes && trade.mistakes.length > 0 && <div className="col-span-2 md:col-span-4"><p className="text-sm text-muted-foreground">Mistakes</p><div className="flex flex-wrap gap-2 mt-1">{trade.mistakes.map(m => <Badge key={m} variant="secondary">{m}</Badge>)}</div></div>}
          {trade.chartUrl && <div className="col-span-2 md:col-span-4"><a href={trade.chartUrl} target="_blank" rel="noopener noreferrer"><img src={trade.chartUrl} alt="Trade chart" className="max-w-xs rounded-md mt-2"/></a></div>}
        </div>
        <div className="flex gap-2 mt-4">
          <EditTradeDialog trade={trade}>
            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
          </EditTradeDialog>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
        </div>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this trade.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </AccordionContent>
    </AccordionItem>
  )
}

export default function JournalListPage() {
  const { trades, deleteTrade, loading } = useTrades();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const sortedTrades = React.useMemo(() => {
    return [...trades].sort((a, b) => {
      const dateA = new Date(a.closing_time_utc).getTime();
      const dateB = new Date(b.closing_time_utc).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [trades, sortOrder]);

  const filteredTrades = React.useMemo(() => {
    return sortedTrades.filter(trade =>
      trade.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedTrades, searchTerm]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  }

  const handleDelete = (ticket: number) => {
    deleteTrade(ticket);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Trade Journal</h1>
            <p className="text-muted-foreground">
              A detailed log of all your trades.
            </p>
          </div>
           <Link href="/journal">
                <Button variant="outline">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Calendar View
                    <ChevronsRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Trades</CardTitle>
            <CardDescription>
              Browse, edit, and review your complete trading history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Input
                placeholder="Search by symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={toggleSortOrder}>
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort by Date ({sortOrder === 'asc' ? 'Oldest' : 'Newest'})
              </Button>
              <div className="ml-auto">
                 <AddTradeDialog>
                    <Button>Log New Trade</Button>
                </AddTradeDialog>
              </div>
            </div>

            {loading ? (
              <p>Loading trades...</p>
            ) : filteredTrades.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredTrades.map((trade: Trade) => (
                  <TradeCard key={`${trade.ticket}-${trade.closing_time_utc}`} trade={trade} onDelete={handleDelete} />
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No trades found. Start by logging a new trade.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
