"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { useTrades } from "@/context/trade-provider"

export function MistakesChart() {
  const { trades } = useTrades();

  const mistakeCounts = React.useMemo(() => {
    const allMistakes = trades.flatMap(trade => trade.mistakes || []);
    return allMistakes.reduce((acc, mistake) => {
      acc[mistake] = (acc[mistake] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [trades]);

  const chartData = React.useMemo(() => Object.entries(mistakeCounts).map(([mistake, count], index) => ({
    name: mistake,
    value: count,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  })), [mistakeCounts]);


  const chartConfig = React.useMemo(() => Object.fromEntries(
    chartData.map((item, index) => [
      item.name,
      { label: item.name, color: `hsl(var(--chart-${(index % 5) + 1}))` },
    ])
  ), [chartData]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Mistake Analysis</CardTitle>
        <CardDescription>Frequency of your trading mistakes.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                 {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
            No mistake data available.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
