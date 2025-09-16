
"use client"

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockMarketData } from "@/lib/data"
import type { MarketData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"

const MiniChart = ({ isUp }: { isUp: boolean }) => {
  const path = isUp 
    ? "M2 20 L18 6 L30 12 L48 2"
    : "M2 2 L18 16 L30 10 L48 20";
  const color = isUp ? "stroke-accent" : "stroke-destructive";
  
  return (
    <svg width="50" height="22" viewBox="0 0 50 22" className="opacity-50">
      <path d={path} fill="none" className={color} strokeWidth="2"/>
    </svg>
  );
};

const SentimentGauge = ({ score }: { score: number }) => {
    const rotation = (score / 100) * 180;
    const color = score > 60 ? "hsl(var(--accent))" : score < 40 ? "hsl(var(--destructive))" : "hsl(var(--primary))";

    return (
        <div className="w-16 h-8 relative">
            <div 
                className="absolute bottom-0 left-0 right-0 h-8 rounded-t-full border-b-0 border-4 border-muted/50"
                style={{ clipPath: "inset(0 0 50% 0)"}}
            />
            <div 
                className="absolute bottom-0 left-1/2 w-1 h-8 origin-bottom transition-transform" 
                style={{ transform: `translateX(-50%) rotate(${rotation - 90}deg)`}}
            >
                <div className="w-full h-1/2 rounded-t-full" style={{ backgroundColor: color }} />
            </div>
            <div className="absolute bottom-0 left-1/2 w-2 h-1 bg-foreground rounded-full transform -translate-x-1/2" />
        </div>
    )
}

export default function MarketPage() {
    const [marketData, setMarketData] = React.useState<MarketData[]>(mockMarketData);
    const [searchTerm, setSearchTerm] = React.useState("");

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMarketData(prevData =>
                prevData.map(item => {
                    const change = (Math.random() - 0.5) * (item.volatilityScore / 100);
                    const newPrice = item.price * (1 + change);
                    const priceChange = ((newPrice - item.initialPrice) / item.initialPrice) * 100;
                    const sentimentChange = (Math.random() - 0.5) * 5;
                    let newSentiment = item.sentimentScore + sentimentChange;
                    if (newSentiment > 100) newSentiment = 100;
                    if (newSentiment < 0) newSentiment = 0;

                    return { ...item, price: newPrice, change: priceChange, sentimentScore: newSentiment };
                })
            );
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const filteredMarketData = marketData.filter(item =>
        item.pair.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout>
            <div className="space-y-6">
                 <div>
                    <h1 className="text-3xl font-bold">Live Market</h1>
                    <p className="text-muted-foreground">Monitor forex pairs in real-time.</p>
                </div>
                
                <Card>
                    <CardHeader>
                        <Input 
                            placeholder="Search pairs..."
                            className="max-w-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredMarketData.map(item => {
                                const isUp = item.change >= 0;
                                return (
                                    <Card key={item.pair} className="flex flex-col justify-between p-4">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-bold">{item.pair}</h3>
                                                <div className={cn("flex items-center text-sm font-semibold", isUp ? "text-accent" : "text-destructive")}>
                                                    {isUp ? <TrendingUp className="h-4 w-4 mr-1"/> : <TrendingDown className="h-4 w-4 mr-1"/>}
                                                    {item.change.toFixed(2)}%
                                                </div>
                                            </div>
                                            <p className="text-2xl font-mono mt-1">{item.price.toFixed(4)}</p>
                                        </div>
                                        <div className="flex justify-between items-end mt-4">
                                            <MiniChart isUp={isUp} />
                                            <SentimentGauge score={item.sentimentScore} />
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}

    