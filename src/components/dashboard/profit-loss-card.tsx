
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useTrades } from "@/context/trade-provider"
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns"

const chartConfig = {
  pnl: {
    label: "PNL",
    color: "hsl(var(--accent))",
  },
}

export function ProfitLossCard() {
  const { trades } = useTrades();
  const [activeTab, setActiveTab] = React.useState('all');

  const generateChartData = React.useCallback((period: 'day' | 'week' | 'month' | 'year' | 'all') => {
    const now = new Date();
    let startDate: Date | null = null;
    let groupBy: (date: Date) => string;

    switch (period) {
      case 'day':
        startDate = startOfDay(now);
        groupBy = (date) => new Date(date.setMinutes(0, 0, 0)).toISOString(); // Group by hour
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        groupBy = (date) => startOfDay(date).toISOString(); // Group by day
        break;
      case 'month':
        startDate = startOfMonth(now);
        groupBy = (date) => startOfDay(date).toISOString(); // Group by day
        break;
      case 'year':
        startDate = startOfYear(now);
        groupBy = (date) => startOfMonth(date).toISOString(); // Group by month
        break;
      case 'all':
      default:
        // For all, we need a consistent key for grouping, let's use date
        groupBy = (date) => startOfDay(date).toISOString(); 
        break;
    }
    
    const sortedTrades = [...trades].sort((a,b) => new Date(a.closing_time_utc).getTime() - new Date(b.closing_time_utc).getTime());
    
    const filteredTrades = startDate ? sortedTrades.filter(t => new Date(t.closing_time_utc) >= startDate!) : sortedTrades;

    const pnlByGroup = filteredTrades.reduce((acc, trade) => {
        const groupKey = groupBy(new Date(trade.closing_time_utc));
        acc[groupKey] = (acc[groupKey] || 0) + (trade.profit_usd || 0);
        return acc;
    }, {} as Record<string, number>);

    let cumulativePnl = 0;
    const chartData = Object.entries(pnlByGroup).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()).map(([key, pnl]) => {
      cumulativePnl += pnl;
      return { time: key, pnl: cumulativePnl };
    });

    const total = filteredTrades.reduce((sum, t) => sum + (t.profit_usd || 0), 0);
    const highestWin = filteredTrades.reduce((max, t) => Math.max(max, t.profit_usd || 0), 0);
    const highestLoss = filteredTrades.reduce((min, t) => Math.min(min, t.profit_usd || 0), 0);
    
    return { data: chartData, total, highestWin, highestLoss };
  }, [trades]);

  const periods = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "all", label: "All" },
  ];

  const { data, total, highestWin, highestLoss } = React.useMemo(() => generateChartData(activeTab as any), [activeTab, generateChartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit / Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {periods.map((p) => <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>)}
          </TabsList>
            <TabsContent value={activeTab} className="mt-4">
                <div className="py-4 space-y-2">
                    <div>
                        <p className="text-sm text-muted-foreground">Net P/L</p>
                        <p className={`text-3xl font-bold ${total >= 0 ? 'text-accent' : 'text-destructive'}`}>
                            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Highest Win</p>
                            <p className="text-xl font-semibold text-accent">
                                ${highestWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Highest Loss</p>
                            <p className="text-xl font-semibold text-destructive">
                                ${highestLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
                <ChartContainer config={chartConfig} className="h-40 w-full">
                  <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={total >= 0 ? "var(--color-pnl)" : "hsl(var(--destructive))"} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={total >= 0 ? "var(--color-pnl)" : "hsl(var(--destructive))"} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Area dataKey="pnl" type="natural" fill="url(#fillPnl)" stroke={total >= 0 ? "var(--color-pnl)" : "hsl(var(--destructive))"} stackId="a" />
                  </AreaChart>
                </ChartContainer>
             </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
