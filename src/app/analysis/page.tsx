"use client"

import MainLayout from "@/components/layout/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiInsights } from "@/components/analysis/ai-insights";
import { MistakesChart } from "@/components/analysis/mistakes-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { mockTrades } from "@/lib/data"
import { Progress } from "@/components/ui/progress";

const profitabilityByPair = mockTrades.reduce((acc, trade) => {
    if (!acc[trade.pair]) {
        acc[trade.pair] = 0;
    }
    acc[trade.pair] += trade.profit;
    return acc;
}, {} as Record<string, number>);

const profitabilityChartData = Object.entries(profitabilityByPair).map(([pair, pnl]) => ({
    pair,
    pnl,
    fill: pnl >= 0 ? "hsl(var(--accent))" : "hsl(var(--destructive))",
}));

const chartConfig = {
  pnl: { label: "PNL" },
} satisfies ChartConfig

export default function AnalysisPage() {
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
                                    <span className="text-sm">2.1 : 1</span>
                                </div>
                                <Progress value={70} />
                                <p className="text-xs text-muted-foreground mt-1">Target: 3:1</p>
                            </div>
                             <div>
                                <div className="flex justify-between mb-1">
                                    <h4 className="text-sm font-medium">Win Rate</h4>
                                    <span className="text-sm">65%</span>
                                </div>
                                <Progress value={65} className="[&>*]:bg-accent" />
                                <p className="text-xs text-muted-foreground mt-1">Target: 60%</p>
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
