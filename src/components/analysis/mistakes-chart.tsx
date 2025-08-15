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
import { mockTrades, mistakeTags } from "@/lib/data"

const allMistakes = mockTrades.flatMap(trade => trade.mistakes);
const mistakeCounts = allMistakes.reduce((acc, mistake) => {
  acc[mistake] = (acc[mistake] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const chartData = Object.entries(mistakeCounts).map(([mistake, count]) => ({
  name: mistake,
  value: count,
  fill: `hsl(var(--chart-${Object.keys(mistakeCounts).indexOf(mistake) + 1}))`,
}));

const chartConfig = Object.fromEntries(
  chartData.map((item, index) => [
    item.name,
    { label: item.name, color: `hsl(var(--chart-${index + 1}))` },
  ])
);

export function MistakesChart() {
  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mistake Analysis</CardTitle>
        <CardDescription>Frequency of your trading mistakes.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
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
      </CardContent>
    </Card>
  )
}
