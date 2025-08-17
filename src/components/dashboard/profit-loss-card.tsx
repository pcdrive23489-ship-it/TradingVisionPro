"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useTrades } from "@/context/trade-provider"
import { subDays, subWeeks, subMonths, subYears, startOfDay, startOfWeek, startOfMonth, startOfYear, format } from "date-fns"

const chartConfig = {
  pnl: {
    label: "PNL",
    color: "hsl(var(--accent))",
  },
}

export function ProfitLossCard() {
  const { trades } = useTrades();

  const generateChartData = React.useCallback((period: 'day' | 'week' | 'month' | 'year') => {
    const now = new Date();
    let startDate: Date;
    let dataFormat: string;
    let groupBy: (date: Date) => string;

    switch (period) {
      case 'day':
        startDate = startOfDay(now);
        dataFormat = "HH:mm";
        groupBy = (date) => format(date, "HH");
        break;
      case 'week':
        startDate = startOfWeek(now);
        dataFormat = "EEE";
         groupBy = (date) => format(date, "EEE");
        break;
      case 'month':
        startDate = startOfMonth(now);
        dataFormat = "d";
        groupBy = (date) => format(date, "d");
        break;
      case 'year':
        startDate = startOfYear(now);
        dataFormat = "MMM";
        groupBy = (date) => format(date, "MMM");
        break;
      default:
        throw new Error("Invalid period");
    }

    const filteredTrades = trades.filter(t => new Date(t.closing_time_utc) >= startDate);
    
    const pnlByGroup = filteredTrades.reduce((acc, trade) => {
        const groupKey = groupBy(new Date(trade.closing_time_utc));
        acc[groupKey] = (acc[groupKey] || 0) + trade.profit_usd;
        return acc;
    }, {} as Record<string, number>);


    let cumulativePnl = 0;
    const chartData = Object.entries(pnlByGroup).map(([key, pnl]) => {
      cumulativePnl += pnl;
      return { time: key, pnl: cumulativePnl };
    });

    const total = filteredTrades.reduce((sum, t) => sum + t.profit_usd, 0);

    return { data: chartData, total };
  }, [trades]);

  const periods = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  const [activeTab, setActiveTab] = React.useState('week');
  const { data, total } = React.useMemo(() => generateChartData(activeTab as any), [activeTab, generateChartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit / Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {periods.map((p) => <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>)}
          </TabsList>
            <TabsContent value={activeTab} forceMount>
                <div className="py-4">
                    <p className={`text-3xl font-bold ${total >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {/* Change calculation can be added here if historical data is available */}
                </div>
                <ChartContainer config={chartConfig} className="h-40 w-full">
                  <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-pnl)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-pnl)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Area dataKey="pnl" type="natural" fill="url(#fillPnl)" stroke="var(--color-pnl)" stackId="a" />
                  </AreaChart>
                </ChartContainer>
             </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
