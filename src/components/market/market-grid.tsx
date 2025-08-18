
"use client"

import * as React from "react"
import { Area, AreaChart } from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChartContainer } from "@/components/ui/chart"
import type { MarketData } from "@/lib/types"

const chartConfig = {
  price: { color: "hsl(var(--accent))" },
}


function PairCard({ pairData }: { pairData: MarketData }) {
    const isPositive = pairData.change >= 0;
    
    // Create a mini chart data that fluctuates around a baseline
    const miniChartData = React.useMemo(() => {
        let lastValue = 15;
        return Array.from({ length: 10 }, () => {
            lastValue += (Math.random() - 0.5) * 5;
            return { value: Math.max(5, lastValue) }; // Ensure value is not too low
        });
    }, [pairData.price]); // Re-calculate when price changes for visual effect


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">{pairData.pair}</CardTitle>
                <div className="h-10 w-20">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                        <AreaChart
                            data={miniChartData}
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id={`fill${pairData.pair.replace('/', '')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? "var(--color-price)" : "hsl(var(--destructive))"} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={isPositive ? "var(--color-price)" : "hsl(var(--destructive))"} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <Area
                                dataKey="value"
                                type="natural"
                                fill={`url(#fill${pairData.pair.replace('/', '')})`}
                                stroke={isPositive ? "var(--color-price)" : "hsl(var(--destructive))"}
                                stackId="a"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold">{pairData.price.toFixed(4)}</div>
                <p className={`text-sm font-medium ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                    {isPositive ? '+' : ''}{pairData.change.toFixed(2)}%
                </p>
                <div className="mt-4">
                    <CardDescription className="mb-1 text-xs">Sentiment ({pairData.sentimentScore}% Buy)</CardDescription>
                    <Progress value={pairData.sentimentScore} className="h-2 [&>*]:bg-primary" />
                </div>
            </CardContent>
        </Card>
    )
}

export function MarketGrid({ marketData }: { marketData: MarketData[] }) {
  if (!marketData || marketData.length === 0) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No market data to display.</p>
            </CardContent>
        </Card>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {marketData.map(pair => (
        <PairCard key={pair.pair} pairData={pair} />
      ))}
    </div>
  )
}
