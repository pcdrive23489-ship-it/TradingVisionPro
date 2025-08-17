
"use client"

import { useState } from "react"
import { Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getTradingInsights, TradingInsightsInput, TradingInsightsOutput } from "@/ai/flows/trading-insights"
import { Skeleton } from "../ui/skeleton"
import { useTrades } from "@/context/trade-provider"

export function AiInsights() {
  const [insights, setInsights] = useState<TradingInsightsOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { trades } = useTrades()

  const handleGenerateInsights = async () => {
    setIsLoading(true)
    setInsights(null);
    try {
      const tradingData: TradingInsightsInput = {
        tradingData: {
          trades: trades.map(t => ({
            pair: t.symbol,
            direction: t.type,
            entryPrice: t.opening_price,
            exitPrice: t.closing_price,
            pips: t.pips || 0,
            session: t.session || 'London', // Default to a session if not present
            mistakes: t.mistake_1 ? [t.mistake_1] : [],
            riskRewardRatio: t.risk_reward_ratio,
          }))
        }
      };

      const result = await getTradingInsights(tradingData);
      setInsights(result);
    } catch (error) {
      console.error("Failed to get AI insights:", error);
      toast({
        title: "Error",
        description: "Could not generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>AI-Suggested Insights</CardTitle>
                <CardDescription>Get personalized recommendations from our AI.</CardDescription>
            </div>
            <Button onClick={handleGenerateInsights} disabled={isLoading || trades.length === 0}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? "Analyzing..." : "Generate Insights"}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            </div>
        )}
        {!isLoading && !insights && (
          <div className="text-center text-muted-foreground py-8">
            <Wand2 className="mx-auto h-12 w-12 mb-4" />
             {trades.length === 0 ? (
              <p>Import your trades first to get AI insights.</p>
            ) : (
              <p>Click &quot;Generate Insights&quot; to see what our AI thinks you can improve.</p>
            )}
          </div>
        )}
        {insights && (
          <div className="space-y-4">
            {insights.insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg bg-background">
                <h4 className="font-semibold text-primary">{insight.recommendation}</h4>
                <p className="text-sm text-muted-foreground">{insight.rationale}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
