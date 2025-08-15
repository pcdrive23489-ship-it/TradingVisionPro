"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, Legend } from "recharts"
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
  profit: {
    label: "Profit",
    color: "hsl(var(--accent))",
  },
  loss: {
    label: "Loss",
    color: "hsl(var(--destructive))",
  }
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
              tickFormatter={(value) => value}
            />
            <YAxis
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
             <Legend content={({ payload }) => {
              return (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--accent))" }}/>
                    <span className="text-sm text-muted-foreground">Profit</span>
                  </div>
                   <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--destructive))" }}/>
                    <span className="text-sm text-muted-foreground">Loss</span>
                  </div>
                </div>
              )
            }} />
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
