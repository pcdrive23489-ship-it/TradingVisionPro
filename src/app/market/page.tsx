import MainLayout from "@/components/layout/main-layout"
import { MarketGrid } from "@/components/market/market-grid"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

export default function MarketPage() {
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
                    />
                </div>
                
                <MarketGrid />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Activity className="h-6 w-6 text-primary" /> Volatility Alerts
                        </CardTitle>
                        <CardDescription>Pairs with high volatility right now.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium">GBP/JPY</div>
                        <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium">USD/JPY</div>
                        <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium">XAU/USD</div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
