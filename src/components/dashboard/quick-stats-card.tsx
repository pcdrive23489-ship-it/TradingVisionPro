
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "../ui/badge"
import { useTrades } from "@/context/trade-provider"

export function QuickStatsCard() {
  const { trades } = useTrades();

  const stats = React.useMemo(() => {
    if (trades.length === 0) {
      return [
        { title: "Win Rate", value: "N/A", trend: "0%", trendDirection: "none" },
        { title: "Total Trades", value: "0", trend: "0", trendDirection: "none" },
        { title: "Avg. R/R Ratio", value: "N/A", trend: "0", trendDirection: "none" },
        { title: "Best Pair", value: "N/A", trend: "$0", trendDirection: "none" },
      ];
    }

    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => (t.profit_usd || 0) > 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const tradesWithRR = trades.filter(t => t.risk_reward_ratio);
    const totalRR = tradesWithRR.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0);
    const avgRiskReward = tradesWithRR.length > 0 ? totalRR / tradesWithRR.length : 0;
    
    const pnlByPair = trades.reduce((acc, trade) => {
      acc[trade.symbol] = (acc[trade.symbol] || 0) + (trade.profit_usd || 0);
      return acc;
    }, {} as Record<string, number>);

    const bestPairEntry = Object.entries(pnlByPair).sort((a, b) => b[1] - a[1])[0];
    const bestPair = bestPairEntry ? { name: bestPairEntry[0], pnl: bestPairEntry[1] } : null;

    return [
      { title: "Win Rate", value: `${winRate.toFixed(1)}%`, trend: "", trendDirection: "none" },
      { title: "Total Trades", value: String(totalTrades), trend: "", trendDirection: "none" },
      { title: "Avg. R/R Ratio", value: `${avgRiskReward.toFixed(2)}:1`, trend: "", trendDirection: "none" },
      { title: "Best Pair", value: bestPair ? bestPair.name : "N/A", trend: bestPair ? `+$${bestPair.pnl.toFixed(2)}` : "$0", trendDirection: "up" },
    ];
  }, [trades]);

  return (
    <Carousel opts={{
      align: "start",
      loop: true,
    }} className="w-full">
      <CarouselContent>
        {stats.map((stat, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                   {stat.trend && stat.trendDirection !== 'none' &&
                    <div className="text-xs text-muted-foreground">
                      <Badge variant={stat.trendDirection === 'up' ? 'default' : 'destructive'} className={`${stat.trendDirection === 'up' ? 'bg-accent text-accent-foreground' : ''}`}>
                        {stat.trendDirection === 'up' ? '↑' : '↓'} {stat.trend}
                      </Badge>
                    </div>
                   }
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  )
}
