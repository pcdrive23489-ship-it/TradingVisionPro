import MainLayout from "@/components/layout/main-layout";
import { ProfitLossCard } from "@/components/dashboard/profit-loss-card";
import { SessionPerformanceChart } from "@/components/dashboard/session-performance-chart";
import { QuickStatsCard } from "@/components/dashboard/quick-stats-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockTrades } from "@/lib/data";

export default function DashboardPage() {
  const recentTrades = mockTrades.slice(0, 5);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back, Trader!</h1>
          <p className="text-muted-foreground">Here's your performance at a glance.</p>
        </div>

        <div className="w-full">
          <QuickStatsCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProfitLossCard />
          </div>
          <div className="lg:col-span-2">
            <SessionPerformanceChart />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>A look at your last few trades.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pair</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead>Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrades.map((trade) => (
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
                    <TableCell>{trade.session}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
