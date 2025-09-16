
"use client"

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTrades } from "@/context/trade-provider"
import { format, startOfDay, startOfWeek } from "date-fns"
import type { Trade } from "@/lib/types"

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    valueClassName?: string;
    trade?: Trade;
}

function StatCard({ title, value, description, valueClassName, trade }: StatCardProps) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
            <p className={`text-3xl font-bold ${valueClassName}`}>
                {typeof value === 'number' ? `$${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`: value}
            </p>
            {trade && (
                <p className="text-sm text-muted-foreground mt-2">
                    {trade.symbol} ({trade.type}) on {format(new Date(trade.closing_time_utc), 'PP')}
                </p>
            )}
        </CardContent>
      </Card>
    )
}


export default function RecordsPage() {
    const { trades } = useTrades();

    const records = React.useMemo(() => {
        if (trades.length === 0) {
            return {
                highestWin: null,
                highestLoss: null,
                bestDay: { date: null, pnl: 0 },
                worstDay: { date: null, pnl: 0 },
                bestWeek: { date: null, pnl: 0 },
                worstWeek: { date: null, pnl: 0 },
            }
        }

        // Single Trades
        const highestWin = trades.reduce((max, t) => (t.profit_usd || 0) > (max?.profit_usd || -Infinity) ? t : max, trades[0]);
        const highestLoss = trades.reduce((min, t) => (t.profit_usd || 0) < (min?.profit_usd || Infinity) ? t : min, trades[0]);

        // Daily P/L
        const dailyPnl = trades.reduce((acc, t) => {
            const day = startOfDay(new Date(t.closing_time_utc)).toISOString();
            acc[day] = (acc[day] || 0) + (t.profit_usd || 0);
            return acc;
        }, {} as Record<string, number>);
        
        const bestDayEntry = Object.entries(dailyPnl).reduce((max, entry) => entry[1] > max[1] ? entry : max, ["", -Infinity]);
        const worstDayEntry = Object.entries(dailyPnl).reduce((min, entry) => entry[1] < min[1] ? entry : min, ["", Infinity]);

        // Weekly P/L
        const weeklyPnl = trades.reduce((acc, t) => {
            const week = startOfWeek(new Date(t.closing_time_utc), { weekStartsOn: 1 }).toISOString();
            acc[week] = (acc[week] || 0) + (t.profit_usd || 0);
            return acc;
        }, {} as Record<string, number>);

        const bestWeekEntry = Object.entries(weeklyPnl).reduce((max, entry) => entry[1] > max[1] ? entry : max, ["", -Infinity]);
        const worstWeekEntry = Object.entries(weeklyPnl).reduce((min, entry) => entry[1] < min[1] ? entry : min, ["", Infinity]);


        return {
            highestWin,
            highestLoss,
            bestDay: { date: bestDayEntry[0], pnl: bestDayEntry[1] },
            worstDay: { date: worstDayEntry[0], pnl: worstDayEntry[1] },
            bestWeek: { date: bestWeekEntry[0], pnl: bestWeekEntry[1] },
            worstWeek: { date: worstWeekEntry[0], pnl: worstWeekEntry[1] },
        }

    }, [trades]);

    return (
        <MainLayout>
             <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">Trading Records</h1>
                  <p className="text-muted-foreground">Your all-time bests and worsts.</p>
                </div>
                
                {trades.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            <p>No trading data available. Import your trades to see your records.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        <div>
                             <h2 className="text-2xl font-semibold mb-4">Single Trades</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {records.highestWin && <StatCard 
                                    title="Highest Win"
                                    value={records.highestWin.profit_usd || 0}
                                    valueClassName="text-accent"
                                    trade={records.highestWin}
                                />}
                                {records.highestLoss && <StatCard 
                                    title="Highest Loss"
                                    value={records.highestLoss.profit_usd || 0}
                                    valueClassName="text-destructive"
                                    trade={records.highestLoss}
                                />}
                             </div>
                        </div>

                        <div>
                             <h2 className="text-2xl font-semibold mb-4">Daily Records</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StatCard 
                                    title="Best Day"
                                    value={records.bestDay.pnl}
                                    description={records.bestDay.date ? format(new Date(records.bestDay.date), 'PP') : 'N/A'}
                                    valueClassName="text-accent"
                                />
                                 <StatCard 
                                    title="Worst Day"
                                    value={records.worstDay.pnl}
                                    description={records.worstDay.date ? format(new Date(records.worstDay.date), 'PP') : 'N/A'}
                                    valueClassName="text-destructive"
                                />
                             </div>
                        </div>
                        
                        <div>
                             <h2 className="text-2xl font-semibold mb-4">Weekly Records</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <StatCard 
                                    title="Best Week"
                                    value={records.bestWeek.pnl}
                                    description={records.bestWeek.date ? `Week of ${format(new Date(records.bestWeek.date), 'PP')}` : 'N/A'}
                                    valueClassName="text-accent"
                                />
                                 <StatCard 
                                    title="Worst Week"
                                    value={records.worstWeek.pnl}
                                    description={records.worstWeek.date ? `Week of ${format(new Date(records.worstWeek.date), 'PP')}` : 'N/A'}
                                    valueClassName="text-destructive"
                                />
                             </div>
                        </div>
                    </div>
                )}
             </div>
        </MainLayout>
    )
}
