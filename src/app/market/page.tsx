
"use client";

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { TradingViewMarketWidget } from "@/components/market/tradingview-market-widget";

const highVolatilityPairs = ["GBP/JPY", "XAU/USD", "BTC/USD"];

export default function MarketPage() {
    const [searchTerm, setSearchTerm] = React.useState("");

    // The search term will now be passed to the TradingView widget if needed,
    // but the widget has its own internal search.
    // For this implementation, we'll let the user use the widget's search.

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Live Market</h1>
                    <p className="text-muted-foreground">Monitor real-time forex market data from TradingView.</p>
                </div>

                <TradingViewMarketWidget />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Activity className="h-6 w-6 text-primary" /> High-Volatility Pairs
                        </CardTitle>
                        <CardDescription>Pairs that often experience significant movement.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                        {highVolatilityPairs.map(pair => (
                            <div key={pair} className="bg-muted px-3 py-1 rounded-full text-sm font-medium">
                                {pair}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
