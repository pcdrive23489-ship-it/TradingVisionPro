
"use client"

import * as React from "react"
import MainLayout from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiInsights } from "@/components/analysis/ai-insights";
import { MistakesChart } from "@/components/analysis/mistakes-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress";
import { useTrades } from "@/context/trade-provider";

const chartConfig = {
  pnl: { label: "PNL" },
} satisfies ChartConfig

export default function AnalysisPage() {
  const { trades } = useTrades();

  const profitabilityByPair = React.useMemo(() => trades.reduce((acc, trade) => {
      if (!acc[trade.symbol]) {
          acc[trade.symbol] = 0;
      }
      acc[trade.symbol] += trade.profit_usd;
      return acc;
  }, {} as Record<string, number>), [trades]);

  const profitabilityChartData = React.useMemo(() => Object.entries(profitabilityByPair).map(([pair, pnl]) => ({
      pair,
      pnl,
      fill: pnl >= 0 ? "hsl(var(--accent))" : "hsl(var(--destructive))",
  })), [profitabilityByPair]);

  const { avgRiskReward, profitRatio } = React.useMemo(() => {
    if (trades.length === 0) return { avgRiskReward: 0, profitRatio: 0 };
    
    const totalWins = trades.filter(t => t.profit_usd > 0).reduce((sum, t) => sum + t.profit_usd, 0);
    const totalLosses = Math.abs(trades.filter(t => t.profit_usd < 0).reduce((sum, t) => sum + t.profit_usd, 0));
    const profitRatioValue = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
    
    const tradesWithRR = trades.filter(t => t.risk_reward_ratio);
    const totalRR = tradesWithRR.reduce((sum, t) => sum + (t.risk_reward_ratio || 0), 0);
    const avgRiskRewardValue = tradesWithRR.length > 0 ? totalRR / tradesWithRR.length : 0;

    return { avgRiskReward: avgRiskRewardValue, profitRatio: profitRatioValue };
  }, [trades]);


  return (
    <MainLayout>
       <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Performance Analysis</h1>
          <p className="text-muted-foreground">Dive deep into your trading habits.</p>
        </div>
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profitability">Profitability</TabsTrigger>
                <TabsTrigger value="ai">AI Insights</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MistakesChart />
                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Insights</CardTitle>
                            <CardDescription>Your risk management performance.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <h4 className="text-sm font-medium">Average Risk/Reward</h4>
                                    <span className="text-sm">{avgRiskReward.toFixed(2)} : 1</span>
                                </div>
                                <Progress value={(avgRiskReward / 3) * 100} />
                                <p className="text-xs text-muted-foreground mt-1">Target: 3:1</p>
                            </div>
                             <div>
                                <div className="flex justify-between mb-1">
                                    <h4 className="text-sm font-medium">Profit Ratio</h4>
                                    <span className="text-sm">{profitRatio === Infinity ? "∞" : profitRatio.toFixed(2)}</span>
                                </div>
                                <Progress value={(profitRatio / 3) * 100} className="[&>*]:bg-accent" />
                                <p className="text-xs text-muted-foreground mt-1">Target: &gt; 1.5</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="profitability" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profitability by Instrument</CardTitle>
                        <CardDescription>Which pairs are making you money?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-80 w-full">
                            <BarChart data={profitabilityChartData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis dataKey="pair" type="category" tickLine={false} axisLine={false} tickMargin={8} />
                                <XAxis dataKey="pnl" type="number" hide />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="pnl" layout="vertical" radius={5} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="ai" className="mt-6">
                <AiInsights />
            </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
