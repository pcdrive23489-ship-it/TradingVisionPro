"use client"
import * as React from 'react'
import Image from "next/image"
import MainLayout from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { Trade } from '@/lib/types'
import { EditTradeDialog } from '@/components/journal/edit-trade-dialog'
import { format } from 'date-fns'
import { useTrades } from '@/context/trade-provider'

function TradeCard({ trade }: { trade: Trade }) {
  const isProfit = trade.profit_usd >= 0;

  return (
    <Card>
      <AccordionItem value={String(trade.ticket)} className="border-b-0">
        <AccordionTrigger className="p-4 hover:no-underline">
          <div className="flex-1 grid grid-cols-3 md:grid-cols-5 gap-4 text-left">
            <div className="font-medium">{trade.symbol}</div>
            <div className="hidden md:block">{format(new Date(trade.opening_time_utc), 'P')}</div>
            <div>
              <Badge variant={trade.type === 'buy' ? 'outline' : 'destructive'} className={`capitalize ${trade.type === 'buy' ? 'border-primary text-primary' : ''}`}>
                {trade.type}
              </Badge>
            </div>
            <div className={`font-semibold ${isProfit ? 'text-accent' : 'text-destructive'}`}>
              {isProfit ? '+' : ''}${trade.profit_usd.toFixed(2)}
            </div>
            <div className="hidden md:block">{trade.close_reason}</div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4 pt-0">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Trade Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Entry:</strong> {trade.opening_price}</p>
                <p><strong>Exit:</strong> {trade.closing_price}</p>
                <p><strong>Take Profit:</strong> {trade.take_profit}</p>
                <p><strong>Stop Loss:</strong> {trade.stop_loss}</p>
                <p><strong>Lots:</strong> {trade.lots}</p>
                <p><strong>Commission:</strong> ${trade.commission_usd}</p>
                <p><strong>Swap:</strong> ${trade.swap_usd}</p>
              </div>
              {trade.mistakes && trade.mistakes.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Mistakes</h4>
                  <div className="flex flex-wrap gap-2">
                    {trade.mistakes.map(m => <Badge key={m} variant="secondary">{m}</Badge>)}
                  </div>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground mb-4">{trade.notes || "No notes for this trade."}</p>
              {trade.chartUrl && (
                <Image src={trade.chartUrl} alt={`Chart for ${trade.symbol} trade`} width={300} height={150} className="rounded-md" data-ai-hint="chart graph" />
              )}
            </div>
          </div>
           <div className="flex justify-end gap-2 mt-4">
              <EditTradeDialog trade={trade}>
                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
              </EditTradeDialog>
              <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
            </div>
        </AccordionContent>
      </AccordionItem>
    </Card>
  )
}


export default function JournalPage() {
    const [searchTerm, setSearchTerm] = React.useState("")
    const { trades } = useTrades();
    
    const filteredTrades = trades.filter(trade => 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Trade Journal</h1>
          <p className="text-muted-foreground">Review and analyze your past trades.</p>
        </div>
        <div className="flex justify-between items-center">
            <Input 
                placeholder="Search by symbol..." 
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="hidden md:block">
            <div className="grid grid-cols-5 gap-4 px-4 pb-2 text-sm font-medium text-muted-foreground">
                <div>Symbol</div>
                <div>Date</div>
                <div>Type</div>
                <div>Profit/Loss</div>
                <div>Close Reason</div>
            </div>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {filteredTrades.map(trade => (
            <TradeCard key={trade.ticket} trade={trade} />
          ))}
        </Accordion>
      </div>
    </MainLayout>
  )
}
