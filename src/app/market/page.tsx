
"use client";

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { MarketGrid } from "@/components/market/market-grid"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import type { MarketData } from "@/lib/types";
import { mockMarketData } from "@/lib/data";

export default function MarketPage() {
    const [marketData, setMarketData] = React.useState<MarketData[]>(mockMarketData);
    const [searchTerm, setSearchTerm] = React.useState("");

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMarketData(prevData =>
                prevData.map(pair => {
                    const change = (Math.random() - 0.495) * 0.001 * pair.price;
                    const newPrice = pair.price + change;
                    const newChangePercent = ((newPrice - pair.initialPrice) / pair.initialPrice) * 100;
                    return { ...pair, price: newPrice, change: newChangePercent };
                })
            );
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const filteredData = marketData.filter(pair => 
        pair.pair.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const highVolatilityPairs = [...marketData]
        .sort((a, b) => b.volatilityScore - a.volatilityScore)
        .slice(0, 3);

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Live Market</h1>
                    <p className="text-muted-foreground">Monitor real-time forex market data.</p>
                </div>
                <div className="flex justify-between items-center">
                    <Input
                        placeholder="Search pairs..."
                        className="max-w-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <MarketGrid marketData={filteredData} />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Activity className="h-6 w-6 text-primary" /> Volatility Alerts
                        </CardTitle>
                        <CardDescription>Pairs with high volatility right now.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                        {highVolatilityPairs.map(pair => (
                            <div key={pair.pair} className="bg-muted px-3 py-1 rounded-full text-sm font-medium">
                                {pair.pair}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
