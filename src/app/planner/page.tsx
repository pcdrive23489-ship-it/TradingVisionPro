
"use client"

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Wand2 } from "lucide-react"

const fiscalYears = ["FY25", "FY26", "FY27", "FY28", "FY29", "FY30"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatCard({ title, value, footer }: { title: string, value: string, footer?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {footer && <CardContent><p className="text-xs text-muted-foreground">{footer}</p></CardContent>}
    </Card>
  )
}

function TargetBar({ title, actual, target }: { title: string, actual: number, target: number }) {
  const progress = Math.min((actual / target) * 100, 100);
  return (
    <div>
        <div className="flex justify-between mb-1">
            <h4 className="text-sm font-medium">{title}</h4>
            <span className="text-sm text-muted-foreground">${actual.toLocaleString()} / ${target.toLocaleString()}</span>
        </div>
        <Progress value={progress} />
    </div>
  )
}

function MonthlyPlanner() {
    return (
        <Tabs defaultValue="Jan">
            <TabsList>
                {months.map(month => <TabsTrigger key={month} value={month}>{month}</TabsTrigger>)}
            </TabsList>
            {months.map(month => (
                <TabsContent key={month} value={month}>
                   <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{month} Trading Log</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Opening</TableHead>
                                                <TableHead>% Return</TableHead>
                                                <TableHead>P/L</TableHead>
                                                <TableHead>Withdrawals</TableHead>
                                                <TableHead>Closing</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Array.from({length: 5}).map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>0{i+1} {month}</TableCell>
                                                    <TableCell>$10,000</TableCell>
                                                    <TableCell>2.5%</TableCell>
                                                    <TableCell className="text-accent">$250</TableCell>
                                                    <TableCell>$0</TableCell>
                                                    <TableCell>$10,250</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-6">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Monthly Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                   <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total P/L</p>
                                            <p className="text-lg font-bold text-accent">$1,250</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Withdrawals</p>
                                            <p className="text-lg font-bold">$0</p>
                                        </div>
                                         <div>
                                            <p className="text-sm text-muted-foreground">Win %</p>
                                            <p className="text-lg font-bold">75%</p>
                                        </div>
                                         <div>
                                            <p className="text-sm text-muted-foreground">Total Trades</p>
                                            <p className="text-lg font-bold">20</p>
                                        </div>
                                   </div>
                                   <div className="border-t pt-4">
                                        <p className="text-sm text-muted-foreground">Net Closing Balance</p>
                                        <p className="text-2xl font-bold">$11,250</p>
                                   </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wand2 className="text-primary"/> AI Suggestions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground italic">
                                    <p>&quot;Your returns this month are on track. Consider a small increase in risk size for high-probability setups.&quot;</p>
                                </CardContent>
                            </Card>
                        </div>
                   </div>
                </TabsContent>
            ))}
        </Tabs>
    )
}


export default function PlannerPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Income Planner</h1>
          <p className="text-muted-foreground">Plan and track your trading income goals.</p>
        </div>

        <Tabs defaultValue="FY25" className="w-full">
            <TabsList>
                {fiscalYears.map(year => <TabsTrigger key={year} value={year}>{year}</TabsTrigger>)}
            </TabsList>
            
            {fiscalYears.map(year => (
                <TabsContent key={year} value={year} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Master Yearly Summary - {year}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                           <StatCard title="Opening Balance" value="$100,000" />
                           <StatCard title="Total Trades" value="240" />
                           <StatCard title="Total Withdrawals" value="$15,000" />
                           <StatCard title="Yearly Net P/L" value="$50,000" className="text-accent" />
                           <StatCard title="Closing Balance" value="$135,000" />
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Yearly Targets</CardTitle>
                                <CardDescription>Your progress towards your annual goals.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <TargetBar title="Income Target" actual={50000} target={60000} />
                               <TargetBar title="Savings Target" actual={20000} target={25000} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Visualizations</CardTitle>
                                <CardDescription>Charts will be added here soon.</CardDescription>
                            </CardHeader>
                             <CardContent className="flex items-center justify-center text-muted-foreground h-40">
                                <p>Charts coming soon!</p>
                             </CardContent>
                        </Card>
                    </div>
                    
                    <MonthlyPlanner />

                </TabsContent>
            ))}
        </Tabs>
      </div>
    </MainLayout>
  )
}
