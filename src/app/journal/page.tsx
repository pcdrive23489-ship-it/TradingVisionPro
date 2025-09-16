
"use client"

import * as React from "react"
import { format, startOfDay, isSameDay, startOfWeek, getWeek, getMonth, getYear, startOfMonth } from "date-fns"
import { BarChart, BookCopy, CalendarDays, ChevronsRight, Loader2, MinusCircle, PlusCircle } from "lucide-react"

import MainLayout from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
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

type WeeklyStats = {
    week: number;
    pnl: number;
    days: number;
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

const formatPnl = (pnl: number) => {
    if (Math.abs(pnl) >= 1000) {
        return `$${(pnl / 1000).toFixed(2)}K`;
    }
    return pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}


// --- Sub-components ---
function DayContent({ stats }: { stats?: DailyStats }) {
    if (!stats || stats.trades === 0) {
        return <div className="h-24 w-full" />;
    }

    const pnlClass = stats.pnl > 0 ? "text-green-600 dark:text-green-400" : stats.pnl < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground";

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex h-24 w-full flex-col justify-center items-center text-center space-y-1 p-1">
                        <p className={cn("text-base font-bold", pnlClass)}>{formatPnl(stats.pnl)}</p>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>{stats.trades} trade{stats.trades !== 1 && 's'}</p>
                            <p>{stats.avgRR.toFixed(2)}R, {stats.winRate.toFixed(0)}%</p>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="bg-card border-border shadow-lg p-4 rounded-lg w-48">
                    <div className="flex justify-between items-center mb-2">
                        <p className="font-bold">{format(stats.date, 'MMM d, yyyy')}</p>
                        <p className={cn("font-bold text-lg", pnlClass)}>{formatPnl(stats.pnl)}</p>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Trades:</span>
                            <span>{stats.trades}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Win Rate:</span>
                            <span>{stats.winRate.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg R:R:</span>
                            <span>{stats.avgRR.toFixed(1)}</span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function MetricWidget({ title, value, unit, description }: { title: string, value: string, unit?: string, description: string }) {
    return (
        <Card className="bg-card/50">
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl xl:text-3xl">
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
  const [month, setMonth] = React.useState(startOfMonth(new Date()))

  const dailyStats = React.useMemo(() => calculateDailyStats(trades), [trades])
  const overallMetrics = React.useMemo(() => calculateOverallMetrics(trades), [trades])

  const selectedDayStats = selectedDay
    ? dailyStats.get(startOfDay(selectedDay).toISOString())
    : undefined

  const weeklyStats: WeeklyStats[] = React.useMemo(() => {
    const currentMonth = getMonth(month)
    const currentYear = getYear(month)

    const weeks: Record<number, { pnl: number, days: Set<string> }> = {}
    
    trades
        .filter(trade => {
            const tradeDate = new Date(trade.closing_time_utc)
            return getMonth(tradeDate) === currentMonth && getYear(tradeDate) === currentYear
        })
        .forEach(trade => {
            const tradeDate = new Date(trade.closing_time_utc)
            const weekNumber = getWeek(tradeDate, { weekStartsOn: 1 })

            if (!weeks[weekNumber]) {
                weeks[weekNumber] = { pnl: 0, days: new Set() }
            }
            weeks[weekNumber].pnl += trade.profit_usd || 0
            weeks[weekNumber].days.add(startOfDay(tradeDate).toISOString())
        })

    return Object.entries(weeks)
        .map(([week, data]) => ({
            week: Number(week),
            pnl: data.pnl,
            days: data.days.size,
        }))
        .sort((a, b) => a.week - b.week)
}, [trades, month]);


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
            <Link href="/journal-list">
                <Button variant="outline">
                    <BookCopy className="mr-2 h-4 w-4" />
                    List View
                    <ChevronsRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9">
                 <Card>
                    <CardContent className="p-2 sm:p-4">
                        <Calendar
                            month={month}
                            onMonthChange={setMonth}
                            mode="single"
                            selected={selectedDay}
                            onSelect={setSelectedDay}
                            className="p-0"
                            formatters={{
                                formatDay: (date) => {
                                    const stats = dailyStats.get(startOfDay(date).toISOString());
                                    return <DayContent stats={stats} />;
                                },
                            }}
                            classNames={{
                                months: "w-full",
                                month: "w-full space-y-4",
                                caption_label: "text-lg font-bold",
                                head_cell: "w-full text-muted-foreground uppercase text-xs font-normal text-center",
                                table: "w-full border-collapse",
                                head_row: "flex border-b",
                                row: "flex w-full mt-2",
                                cell: "p-0 text-center text-sm relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 w-full",
                                day: cn(
                                  "w-full h-full p-0 font-normal focus:outline-none",
                                  "aria-selected:opacity-100"
                                ),
                                day_today: "bg-accent text-accent-foreground",
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_outside: "text-muted-foreground opacity-50",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                day_hidden: "invisible",
                            }}
                            components={{
                                Day: ({ date, displayMonth }) => {
                                    const stats = dailyStats.get(startOfDay(date).toISOString());
                                    const isOutside = displayMonth.getMonth() !== date.getMonth();
                                    const pnl = stats?.pnl;

                                    const cellClass = cn(
                                        "w-full h-full border-l border-t",
                                        {
                                            "bg-green-950/40 border-green-800/50": pnl !== undefined && pnl > 0,
                                            "bg-red-950/40 border-red-800/50": pnl !== undefined && pnl < 0,
                                            "border-border/30": pnl === undefined || pnl === 0,
                                            "opacity-50": isOutside
                                        }
                                    );

                                    return (
                                        <div className={cellClass}>
                                            <time dateTime={date.toISOString()} className="absolute top-1 right-1 text-xs">{format(date, 'd')}</time>
                                            <DayContent stats={stats} />
                                        </div>
                                    );
                                },
                            }}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-3 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Weekly Summary</CardTitle>
                        <CardDescription>{format(month, 'MMMM yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {weeklyStats.map((weekData, index) => (
                             <div key={weekData.week} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-bold">Week {index + 1}</p>
                                    <p className="text-xs text-muted-foreground">{weekData.days} day{weekData.days !== 1 && 's'}</p>
                                </div>
                                <p className={cn("font-semibold", weekData.pnl > 0 ? "text-accent" : weekData.pnl < 0 ? "text-destructive" : "text-muted-foreground")}>
                                    {weekData.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </p>
                             </div>
                        ))}
                         {weeklyStats.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No trades this month.</p>}
                    </CardContent>
                </Card>
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
            </div>
        </div>

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
    </MainLayout>
  )
}

    