"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { mockSessionData } from "@/lib/data"

const chartData = Object.entries(mockSessionData).map(([session, data]) => ({
  session,
  pnl: data.pnl,
  fill: data.pnl >= 0 ? "hsl(var(--accent))" : "hsl(var(--destructive))",
}));

const chartConfig = {
  pnl: {
    label: "PNL",
  },
} satisfies ChartConfig

export function SessionPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Performance</CardTitle>
        <CardDescription>Profit/Loss by trading session</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="session"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="pnl" radius={8}>
                {chartData.map((entry) => (
                    <Cell key={`cell-${entry.session}`} fill={entry.fill} />
                ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
