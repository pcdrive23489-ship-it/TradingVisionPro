"use client"
import * as React from 'react'
import Image from "next/image"
import MainLayout from "@/components/layout/main-layout"
import { mockTrades } from "@/lib/data"
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

function TradeCard({ trade }: { trade: Trade }) {
  const isProfit = trade.profit >= 0;

  return (
    <Card>
      <AccordionItem value={trade.id} className="border-b-0">
        <AccordionTrigger className="p-4 hover:no-underline">
          <div className="flex-1 grid grid-cols-3 md:grid-cols-5 gap-4 text-left">
            <div className="font-medium">{trade.pair}</div>
            <div className="hidden md:block">{new Date(trade.date).toLocaleDateString('en-GB')}</div>
            <div>
              <Badge variant={trade.direction === 'buy' ? 'outline' : 'destructive'} className={`capitalize ${trade.direction === 'buy' ? 'border-primary text-primary' : ''}`}>
                {trade.direction}
              </Badge>
            </div>
            <div className={`font-semibold ${isProfit ? 'text-accent' : 'text-destructive'}`}>
              {isProfit ? '+' : ''}${trade.profit.toFixed(2)}
            </div>
            <div className="hidden md:block">{trade.session}</div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4 pt-0">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Trade Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Entry:</strong> {trade.entryPrice}</p>
                <p><strong>Exit:</strong> {trade.exitPrice}</p>
                <p><strong>Pips:</strong> {trade.pips}</p>
                <p><strong>Lot Size:</strong> {trade.lotSize}</p>
                <p><strong>R/R Ratio:</strong> {trade.riskRewardRatio}:1</p>
              </div>
              {trade.mistakes.length > 0 && (
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
                <Image src={trade.chartUrl} alt={`Chart for ${trade.pair} trade`} width={300} height={150} className="rounded-md" data-ai-hint="chart graph" />
              )}
            </div>
          </div>
           <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
              <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
            </div>
        </AccordionContent>
      </AccordionItem>
    </Card>
  )
}


export default function JournalPage() {
    const [searchTerm, setSearchTerm] = React.useState("")
    const filteredTrades = mockTrades.filter(trade => 
        trade.pair.toLowerCase().includes(searchTerm.toLowerCase())
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
                placeholder="Search by pair..." 
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="hidden md:block">
            <div className="grid grid-cols-5 gap-4 px-4 pb-2 text-sm font-medium text-muted-foreground">
                <div>Pair</div>
                <div>Date</div>
                <div>Direction</div>
                <div>Profit/Loss</div>
                <div>Session</div>
            </div>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {filteredTrades.map(trade => (
            <TradeCard key={trade.id} trade={trade} />
          ))}
        </Accordion>
      </div>
    </MainLayout>
  )
}
