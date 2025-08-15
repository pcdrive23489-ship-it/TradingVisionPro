import MainLayout from "@/components/layout/main-layout"
import { SessionHeatmap } from "@/components/sessions/session-heatmap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { mockTrades } from "@/lib/data"
import { Session } from "@/lib/types"

const sessionTrades = (session: Session) => mockTrades.filter(t => t.session === session);

const SessionTradeList = ({ session }: { session: Session }) => {
    const trades = sessionTrades(session);
    if (trades.length === 0) {
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
                {trades.map((trade) => (
                    <TableRow key={trade.id}>
                        <TableCell className="font-medium">{trade.pair}</TableCell>
                        <TableCell>
                            <Badge variant={trade.direction === "buy" ? "default" : "destructive"} className={`${trade.direction === "buy" ? "bg-primary" : "bg-destructive"}`}>
                                {trade.direction}
                            </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${trade.profit >= 0 ? "text-accent" : "text-destructive"}`}>
                            ${trade.profit.toFixed(2)}
                        </TableCell>
                        <TableCell>{new Date(trade.date).toLocaleString('en-GB')}</TableCell>
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
