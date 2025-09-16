
"use client"

import * as React from "react"
import { format, startOfDay, isSameDay } from "date-fns"
import { BarChart, BookCopy, CalendarDays, ChevronsRight, Loader2, MinusCircle, PlusCircle } from "lucide-react"

import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTrades } from "@/context/trade-provider"
import type { Trade } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type DailyStats = {
  date: Date;
  pnl: number;
  trades: number;
  winRate: number;
  avgRR: number;
  tradeList: Trade[];
}

// --- Helper Functions ---
const calculateDailyStats = (trades: Trade[]): Map<string, DailyStats> => {
  const dailyData = new Map<string, DailyStats>()

  trades.forEach(trade => {
    const day = startOfDay(new Date(trade.closing_time_utc)).toISOString()

    if (!dailyData.has(day)) {
      dailyData.set(day, {
        date: new Date(day),
        pnl: 0,
        trades: 0,
        winRate: 0,
        avgRR: 0,
        tradeList: [],
      })
    }

    const stats = dailyData.get(day)!
    stats.pnl += trade.profit_usd || 0
    stats.trades += 1
    stats.tradeList.push(trade)
  })

  dailyData.forEach(stats => {
    const winningTrades = stats.tradeList.filter(t => (t.profit_usd || 0) > 0).length
    stats.winRate = stats.trades > 0 ? (winningTrades / stats.trades) * 100 : 0

    const tradesWithRR = stats.tradeList.filter(t => t.risk_reward_ratio && t.risk_reward_ratio > 0)
    const totalRR = tradesWithRR.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0)
    stats.avgRR = tradesWithRR.length > 0 ? totalRR / tradesWithRR.length : 0
  })

  return dailyData
}


const calculateOverallMetrics = (trades: Trade[]) => {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      expectancy: 0,
      biggestWin: null,
      biggestLoss: null,
    };
  }

  const winningTrades = trades.filter(t => (t.profit_usd || 0) > 0);
  const losingTrades = trades.filter(t => (t.profit_usd || 0) < 0);

  const grossProfit = winningTrades.reduce((sum, t) => sum + (t.profit_usd || 0), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit_usd || 0), 0));

  const winRate = (winningTrades.length / totalTrades) * 100;
  const lossRate = (losingTrades.length / totalTrades) * 100;

  const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
  
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : Infinity;
  const expectancy = (winRate / 100 * avgWin) - (lossRate / 100 * avgLoss);
  
  const biggestWin = trades.reduce((max, t) => ((t.profit_usd || 0) > (max?.profit_usd || -Infinity) ? t : max), trades[0]);
  const biggestLoss = trades.reduce((min, t) => ((t.profit_usd || 0) < (min?.profit_usd || Infinity) ? t : min), trades[0]);

  return { winRate, profitFactor, expectancy, biggestWin, biggestLoss };
};


// --- Sub-components ---
function DayCell({ stats }: { stats: DailyStats }) {
  const pnlClass = stats.pnl > 0 ? "bg-accent/10" : stats.pnl < 0 ? "bg-destructive/10" : "bg-muted/20";
  const borderClass = stats.pnl > 0 ? "border-accent/40" : stats.pnl < 0 ? "border-destructive/40" : "border-transparent";

  return (
    <div className={cn(
        "flex h-full w-full flex-col p-2 rounded-lg transition-colors",
        pnlClass,
        borderClass
      )}
    >
      <div className="flex-1 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trades</span>
          <span className="font-bold">{stats.trades}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Win%</span>
          <span className="font-bold">{stats.winRate.toFixed(0)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">R:R</span>
          <span className="font-bold">{stats.avgRR.toFixed(1)}</span>
        </div>
      </div>
      <div className={cn(
          "mt-1 text-right text-sm font-bold",
          stats.pnl > 0 ? "text-accent" : stats.pnl < 0 ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {stats.pnl.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
      </div>
    </div>
  )
}

function MetricWidget({ title, value, unit, description }: { title: string, value: string, unit?: string, description: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-3xl">
                    {value}
                    {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

function TradeListItem({ trade }: { trade: Trade }) {
  const isProfit = (trade.profit_usd || 0) >= 0;
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/50">
        <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full", isProfit ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive')}>
                {isProfit ? <PlusCircle className="h-5 w-5" /> : <MinusCircle className="h-5 w-5" />}
            </div>
            <div>
                <p className="font-bold">{trade.symbol}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(trade.closing_time_utc), 'p')}</p>
            </div>
        </div>
        <div className="text-right">
             <p className={cn("font-semibold text-lg", isProfit ? "text-accent" : "text-destructive")}>
                {isProfit ? '+' : ''}{(trade.profit_usd || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
             <Badge variant={trade.type === 'buy' ? 'outline' : 'destructive'} className={`capitalize text-xs ${trade.type === 'buy' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                {trade.type}
            </Badge>
        </div>
    </div>
  )
}


export default function JournalPage() {
  const { trades, loading } = useTrades()
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(new Date())

  const dailyStats = React.useMemo(() => calculateDailyStats(trades), [trades])
  const overallMetrics = React.useMemo(() => calculateOverallMetrics(trades), [trades])

  const selectedDayStats = selectedDay
    ? dailyStats.get(startOfDay(selectedDay).toISOString())
    : undefined

  if (loading) {
    return (
        <MainLayout>
             <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
        </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold">Trading Journal</h1>
                <p className="text-muted-foreground">Review and learn from your daily performance.</p>
            </div>
            <Link href="/journal">
                <Button variant="outline">
                    <BookCopy className="mr-2 h-4 w-4" />
                    List View
                    <ChevronsRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* --- Center Column --- */}
            <div className="lg:col-span-8 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <CalendarDays className="h-5 w-5" /> Journal Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDay}
                            onSelect={setSelectedDay}
                            className="p-0"
                            components={{
                                Day: ({ date }) => {
                                    const stats = dailyStats.get(startOfDay(date).toISOString());
                                    return (
                                        <div className="h-32 w-full">
                                            {stats ? <DayCell stats={stats} /> : null}
                                        </div>
                                    )
                                },
                            }}
                            classNames={{
                                head_cell: "w-full",
                                table: "w-full border-separate border-spacing-2",
                                cell: "p-0",
                                day: "w-full h-full p-0",
                                day_selected: "ring-2 ring-primary rounded-lg",
                            }}
                        />
                    </CardContent>
                </Card>
                {selectedDayStats && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Trades for {format(selectedDay!, 'PPP')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                {selectedDayStats.tradeList.map((trade, idx) => (
                                    <TradeListItem key={idx} trade={trade} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* --- Right Column --- */}
            <div className="lg:col-span-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="h-5 w-5" />
                            Account Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <MetricWidget 
                            title="Win Percentage"
                            value={overallMetrics.winRate.toFixed(1)}
                            unit="%"
                            description="Percentage of trades that were profitable."
                        />
                        <MetricWidget 
                            title="Profit Factor"
                            value={overallMetrics.profitFactor === Infinity ? "∞" : overallMetrics.profitFactor.toFixed(2)}
                            description="Gross profit divided by gross loss."
                        />
                         <MetricWidget 
                            title="Trade Expectancy"
                            value={overallMetrics.expectancy.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            description="Average P/L you can expect per trade."
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Performance Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {overallMetrics.biggestWin && (
                         <div>
                            <h4 className="text-sm font-semibold text-accent">Biggest Win</h4>
                            <p className="text-lg font-bold">{overallMetrics.biggestWin.profit_usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            <p className="text-xs text-muted-foreground">{overallMetrics.biggestWin.symbol} on {format(new Date(overallMetrics.biggestWin.closing_time_utc), 'PP')}</p>
                         </div>
                       )}
                       {overallMetrics.biggestLoss && (
                         <div>
                            <h4 className="text-sm font-semibold text-destructive">Biggest Loss</h4>
                            <p className="text-lg font-bold">{overallMetrics.biggestLoss.profit_usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                            <p className="text-xs text-muted-foreground">{overallMetrics.biggestLoss.symbol} on {format(new Date(overallMetrics.biggestLoss.closing_time_utc), 'PP')}</p>
                         </div>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </MainLayout>
  )
}

    