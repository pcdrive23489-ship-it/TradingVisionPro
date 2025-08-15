"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

const chartData = {
  day: [
    { time: "00:00", pnl: 0 }, { time: "04:00", pnl: 150 },
    { time: "08:00", pnl: 120 }, { time: "12:00", pnl: 300 },
    { time: "16:00", pnl: 250 }, { time: "20:00", pnl: 400 },
  ],
  week: [
    { day: "Mon", pnl: -50 }, { day: "Tue", pnl: 200 },
    { day: "Wed", pnl: 100 }, { day: "Thu", pnl: 450 },
    { day: "Fri", pnl: 300 },
  ],
  month: [
    { week: 1, pnl: 500 }, { week: 2, pnl: 700 },
    { week: 3, pnl: 400 }, { week: 4, pnl: 900 },
  ],
  year: [
    { month: "Jan", pnl: 1000 }, { month: "Feb", pnl: 1200 },
    { month: "Mar", pnl: 800 }, { month: "Apr", pnl: 1500 },
    { month: "May", pnl: 1300 }, { month: "Jun", pnl: 1800 },
  ],
};

const chartConfig = {
  pnl: {
    label: "PNL",
    color: "hsl(var(--accent))",
  },
}

export function ProfitLossCard() {
  const periods = [
    { value: "day", label: "Day", total: 400, change: 5.2, data: chartData.day, xKey: "time" },
    { value: "week", label: "Week", total: 1000, change: 12.1, data: chartData.week, xKey: "day" },
    { value: "month", label: "Month", total: 2500, change: 8.5, data: chartData.month, xKey: "week" },
    { value: "year", label: "Year", total: 7600, change: 25.3, data: chartData.year, xKey: "month" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit / Loss</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week">
          <TabsList className="grid w-full grid-cols-4">
            {periods.map((p) => <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>)}
          </TabsList>
          {periods.map((p) => (
             <TabsContent key={p.value} value={p.value}>
                <div className="py-4">
                    <p className={`text-3xl font-bold ${p.total >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        ${p.total.toLocaleString()}
                    </p>
                    <p className={`text-sm ${p.change >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        {p.change >= 0 ? '↑' : '↓'} {p.change}%
                    </p>
                </div>
                <ChartContainer config={chartConfig} className="h-40 w-full">
                  <AreaChart data={p.data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-pnl)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-pnl)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey={p.xKey} tickLine={false} axisLine={false} tickMargin={8} hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Area dataKey="pnl" type="natural" fill="url(#fillPnl)" stroke="var(--color-pnl)" stackId="a" />
                  </AreaChart>
                </ChartContainer>
             </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
