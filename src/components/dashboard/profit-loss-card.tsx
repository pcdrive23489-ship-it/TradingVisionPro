
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

  const generateChartData = React.useCallback((tradesToProcess: typeof trades) => {
    let sortedTrades = [...tradesToProcess].sort((a,b) => new Date(a.closing_time_utc).getTime() - new Date(b.closing_time_utc).getTime());
    
    let cumulativePnl = 0;
    const chartData = sortedTrades.map(trade => {
      cumulativePnl += (trade.profit_usd || 0);
      return { time: new Date(trade.closing_time_utc).getTime(), pnl: cumulativePnl };
    });

    const total = sortedTrades.reduce((sum, t) => sum + (t.profit_usd || 0), 0);
    
    return { data: chartData, total };
  }, []);

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
    
    return generateChartData(filteredTrades);
  }, [activeTab, trades, generateChartData]);

  const periods = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "all", label: "All" },
  ];

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
                    <XAxis dataKey="time" type="number" scale="time" domain={['dataMin', 'dataMax']} tickLine={false} axisLine={false} tickMargin={8} hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" labelFormatter={(value, payload) => {
                      if (payload && payload.length > 0) {
                        return new Date(payload[0].payload.time).toLocaleDateString();
                      }
                      return value;
                    }} />} />
                    <Area dataKey="pnl" type="natural" fill="url(#fillPnl)" stroke={total >= 0 ? "var(--color-pnl)" : "hsl(var(--destructive))"} stackId="a" />
                  </AreaChart>
                </ChartContainer>
             </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
