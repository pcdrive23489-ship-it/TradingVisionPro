
"use client"

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { SessionHeatmap } from "@/components/sessions/session-heatmap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Session } from "@/lib/types"
import { useTrades } from "@/context/trade-provider"
import { SessionPerformanceChart } from "@/components/dashboard/session-performance-chart"

const SessionTradeList = ({ session }: { session: Session }) => {
    const { trades } = useTrades();
    const sessionTrades = trades.filter(t => t.session === session);

    if (sessionTrades.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No trades in this session.</p>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Pair</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead>Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sessionTrades.map((trade, index) => (
                    <TableRow key={`${trade.ticket}-${trade.closing_time_utc}-${index}`}>
                        <TableCell className="font-medium">{trade.symbol}</TableCell>
                        <TableCell>
                           <Badge variant={trade.type === 'buy' ? 'outline' : 'destructive'} className={`capitalize ${trade.type === 'buy' ? 'border-primary text-primary' : ''}`}>
                                {trade.type}
                            </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${trade.profit_usd >= 0 ? "text-accent" : "text-destructive"}`}>
                            ${(trade.profit_usd || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{new Date(trade.closing_time_utc).toLocaleString('en-GB')}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function SessionsPage() {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Session Breakdown</h1>
                    <p className="text-muted-foreground">Analyze your performance based on trading sessions.</p>
                </div>

                <SessionPerformanceChart />
                <SessionHeatmap />

                <Card>
                    <CardHeader>
                        <CardTitle>Trades by Session</CardTitle>
                        <CardDescription>Filter your trades by specific market sessions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="London" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="Asian">Asian</TabsTrigger>
                                <TabsTrigger value="London">London</TabsTrigger>
                                <TabsTrigger value="New York">New York</TabsTrigger>
                            </TabsList>
                            <TabsContent value="Asian" className="mt-4">
                                <SessionTradeList session="Asian" />
                            </TabsContent>
                            <TabsContent value="London" className="mt-4">
                                <SessionTradeList session="London" />
                            </TabsContent>
                            <TabsContent value="New York" className="mt-4">
                                <SessionTradeList session="New York" />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}
