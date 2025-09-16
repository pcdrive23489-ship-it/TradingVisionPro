
"use client"

import * as React from "react"
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
import { useTrades } from "@/context/trade-provider";
import { Trade } from "@/lib/types";

export default function DashboardPage() {
  const { trades } = useTrades();

  const recentTrades = React.useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(b.closing_time_utc).getTime() - new Date(a.closing_time_utc).getTime())
      .slice(0, 5);
  }, [trades]);

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
                  <TableHead>Symbol</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="hidden md:table-cell">Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrades.map((trade: Trade, index) => (
                  <TableRow key={`${trade.ticket}-${index}`}>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                       <Badge variant={trade.type === 'buy' ? 'outline' : 'destructive'} className={`capitalize ${trade.type === 'buy' ? 'border-primary text-primary' : ''}`}>
                        {trade.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${trade.profit_usd >= 0 ? "text-accent" : "text-destructive"}`}>
                      ${trade.profit_usd.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{trade.session}</TableCell>
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
