
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
    let sortedTrades = [...trades].sort((a,b) => new Date(a.closing_time_utc).getTime() - new Date(b.closing_time_utc).getTime());
    
    const pnlByGroup = sortedTrades.reduce((acc, trade) => {
        const groupKey = startOfDay(new Date(trade.closing_time_utc)).toISOString(); // Group by day
        acc[groupKey] = (acc[groupKey] || 0) + (trade.profit_usd || 0);
        return acc;
    }, {} as Record<string, number>);

    let cumulativePnl = 0;
    const chartData = Object.entries(pnlByGroup).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()).map(([key, pnl]) => {
      cumulativePnl += pnl;
      return { time: key, pnl: cumulativePnl };
    });

    const total = sortedTrades.reduce((sum, t) => sum + (t.profit_usd || 0), 0);
    
    return { data: chartData, total };
  }, [trades]);

  const periods = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "all", label: "All" },
  ];

  const { data, total } = React.useMemo(() => {
    const now = new Date();
    let filteredTrades = trades;

    if (activeTab !== 'all') {
      let startDate: Date;
      if (activeTab === 'day') startDate = startOfDay(now);
      else if (activeTab === 'week') startDate = startOfWeek(now, { weekStartsOn: 1 });
      else if (activeTab === 'month') startDate = startOfMonth(now);
      else startDate = startOfYear(now);
      
      filteredTrades = trades.filter(t => new Date(t.closing_time_utc) >= startDate);
    }
    
    const totalPnl = filteredTrades.reduce((sum, t) => sum + (t.profit_usd || 0), 0);
    const chartResult = generateChartData(activeTab as any);

    return { data: chartResult.data, total: totalPnl };
  }, [activeTab, trades, generateChartData]);

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
