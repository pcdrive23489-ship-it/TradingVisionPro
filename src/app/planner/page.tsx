
"use client"

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Wand2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getDaysInMonth, format } from "date-fns"
import type { PlannerMasterDataState } from "@/lib/planner-calculations"

const fiscalYears = ["FY25", "FY26", "FY27", "FY28", "FY29", "FY30"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const accountTypes = ["Forex Trading", "Online", "Indian Market"];

// --- Data Types ---
interface DailyLog {
  date: string;
  opening: number;
  return: string; // As percentage string e.g., "2.5"
  pnl: number;
  withdrawals: number;
  closing: number;
}

interface MonthlyDataForPlanner {
  log: DailyLog[];
  withdrawals: Record<string, number>;
  profitPercentage: Record<string, number>;
}

interface YearlyDataForPlanner {
  openingBalance: Record<string, number>;
  closingBalance: Record<string, number>;
  totalTrades: number;
  totalWithdrawals: number;
  yearlyNetPL: number;
  incomeTarget: number;
  savingsTarget: number;
  monthly: { [key: string]: MonthlyDataForPlanner };
}


// --- Initial State ---
const generateInitialYearData = (year: string, masterData: PlannerMasterDataState | null): YearlyDataForPlanner => {
  const numericYear = 2000 + parseInt(year.substring(2));
  const monthly: { [key: string]: MonthlyDataForPlanner } = {};

  const masterYearData = masterData?.[year];

  months.forEach((month, monthIndex) => {
    const daysInMonth = getDaysInMonth(new Date(numericYear, monthIndex));
    const log: DailyLog[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(numericYear, monthIndex, i);
      if (date.getDay() > 0 && date.getDay() < 6) { // Trading only on weekdays
         log.push({
          date: format(date, "dd-MMM"),
          opening: 0,
          return: "0",
          pnl: 0,
          withdrawals: 0,
          closing: 0,
        });
      }
    }
    
    const masterMonthData = masterYearData?.monthly[month];
    const totalMonthlyProfitPerc = Object.values(masterMonthData?.profitPercentage || {}).reduce((a: any,b: any) => Number(a)+Number(b), 0);
    const totalMonthlyWithdrawal = Object.values(masterMonthData?.withdrawals || {}).reduce((a: any,b: any) => Number(a)+Number(b), 0);
    
    const dailyWithdrawal = totalMonthlyWithdrawal > 0 && log.length > 0
        ? totalMonthlyWithdrawal / log.length
        : 0;

    log.forEach(day => {
        day.return = String(totalMonthlyProfitPerc);
        day.withdrawals = parseFloat(dailyWithdrawal.toFixed(2));
    });

    monthly[month] = {
      log,
      withdrawals: masterMonthData?.withdrawals || { "Forex Trading": 0, "Online": 0, "Indian Market": 0 },
      profitPercentage: masterMonthData?.profitPercentage || { "Forex Trading": 0, "Online": 0, "Indian Market": 0 }
    };
  });

  return {
    openingBalance: masterYearData?.openingBalance || { "Forex Trading": 0, "Online": 0, "Indian Market": 0 },
    closingBalance: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 },
    totalTrades: 240, 
    totalWithdrawals: 0,
    yearlyNetPL: 0,
    incomeTarget: masterYearData?.incomeTarget || 60000,
    savingsTarget: masterYearData?.savingsTarget || 25000,
    monthly,
  };
};


function StatCard({ title, value, footer, valueClassName }: { title: string, value: string, footer?: string, valueClassName?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className={`text-2xl ${valueClassName}`}>{value}</CardTitle>
      </CardHeader>
      {footer && <CardContent><p className="text-xs text-muted-foreground">{footer}</p></CardContent>}
    </Card>
  )
}

function TargetBar({ title, actual, target }: { title: string, actual: number, target: number }) {
  const progress = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
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

function MonthlyPlanner({ yearData, onDataChange }: { yearData: YearlyDataForPlanner, onDataChange: (month: string, dayIndex: number, field: keyof DailyLog, value: any) => void }) {
  const [activeMonth, setActiveMonth] = React.useState(months[0]);
  
  const handleInputChange = (month: string, dayIndex: number, field: keyof DailyLog, value: string) => {
    onDataChange(month, dayIndex, field, value);
  };

  const monthData = yearData.monthly[activeMonth];

  const monthlySummary = React.useMemo(() => {
    const summary = {
      totalPL: 0,
      totalWithdrawals: 0,
      winPercentage: 0,
      totalTrades: 0,
      netClosing: 0,
    };

    let wins = 0;
    monthData.log.forEach(day => {
      if (day.pnl !== 0) {
        summary.totalTrades += 1;
        if (day.pnl > 0) wins += 1;
      }
      summary.totalPL += day.pnl;
      summary.totalWithdrawals += day.withdrawals;
    });

    summary.winPercentage = summary.totalTrades > 0 ? (wins / summary.totalTrades) * 100 : 0;
    
    const lastDay = monthData.log[monthData.log.length - 1];
    summary.netClosing = lastDay ? lastDay.closing : 0;

    return summary;
  }, [monthData]);


  return (
    <Tabs defaultValue={activeMonth} onValueChange={setActiveMonth}>
      <TabsList className="overflow-x-auto h-auto">
        {months.map(month => <TabsTrigger key={month} value={month}>{month}</TabsTrigger>)}
      </TabsList>
      <TabsContent value={activeMonth}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{activeMonth} Trading Log</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
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
                    {monthData.log.map((day, i) => (
                      <TableRow key={i}>
                        <TableCell>{day.date}</TableCell>
                        <TableCell>${day.opening.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                        <TableCell>
                           <Input 
                            type="text" 
                            value={day.return} 
                            onChange={(e) => handleInputChange(activeMonth, i, 'return', e.target.value)}
                            className="w-20"
                           />
                        </TableCell>
                        <TableCell className={day.pnl >= 0 ? "text-accent" : "text-destructive"}>
                           ${day.pnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </TableCell>
                        <TableCell>
                           <Input 
                            type="number" 
                            value={day.withdrawals} 
                            onChange={(e) => handleInputChange(activeMonth, i, 'withdrawals', e.target.value)}
                            className="w-24"
                           />
                        </TableCell>
                        <TableCell>${day.closing.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
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
                    <p className={`text-lg font-bold ${monthlySummary.totalPL >= 0 ? "text-accent" : "text-destructive"}`}>${monthlySummary.totalPL.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Withdrawals</p>
                    <p className="text-lg font-bold">${monthlySummary.totalWithdrawals.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Win %</p>
                    <p className="text-lg font-bold">{monthlySummary.winPercentage.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Trades</p>
                    <p className="text-lg font-bold">{monthlySummary.totalTrades}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Net Closing Balance</p>
                  <p className="text-2xl font-bold">${monthlySummary.netClosing.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="text-primary" /> AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground italic">
                <p>&quot;Your returns this month are on track. Consider a small increase in risk size for high-probability setups.&quot;</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default function PlannerPage() {
  const [masterData, setMasterData] = React.useState<PlannerMasterDataState | null>(null);
  const [activeYear, setActiveYear] = React.useState(fiscalYears[0]);
  const [yearData, setYearData] = React.useState<YearlyDataForPlanner | null>(null);
  
  // Recalculate everything for the current year.
  const runCalculations = React.useCallback((data: YearlyDataForPlanner): YearlyDataForPlanner => {
    const newData = JSON.parse(JSON.stringify(data)); // Deep copy

    let yearlyNetPL = 0;
    let yearlyTotalWithdrawals = 0;
    let lastMonthClosing = Object.values(newData.openingBalance).reduce((a, b) => a + b, 0);

    for (const month of months) {
        let lastDayClosing = lastMonthClosing;
        const monthData = newData.monthly[month];
        
        monthData.log.forEach((day: DailyLog) => {
            day.opening = lastDayClosing;
            const returnPercent = parseFloat(day.return) || 0;
            day.pnl = parseFloat(((day.opening * returnPercent) / 100).toFixed(2));
            day.withdrawals = Number(day.withdrawals) || 0;
            day.closing = day.opening + day.pnl - day.withdrawals;

            yearlyNetPL += day.pnl;
            yearlyTotalWithdrawals += day.withdrawals;
            lastDayClosing = day.closing;
        });
        if (monthData.log.length > 0) {
          lastMonthClosing = monthData.log[monthData.log.length - 1].closing;
        }
    }

    newData.yearlyNetPL = yearlyNetPL;
    newData.totalWithdrawals = yearlyTotalWithdrawals;
    newData.closingBalance = { "Forex Trading": lastMonthClosing, "Online": 0, "Indian Market": 0 };
    
    // Simplified closing balance distribution
    const totalOpening = Object.values(newData.openingBalance).reduce((a, b) => a + b, 0);
    const totalClosing = lastMonthClosing;
    if (totalOpening > 0) {
        accountTypes.forEach((acc) => {
            const proportion = (newData.openingBalance[acc] || 0) / totalOpening;
            newData.closingBalance[acc] = totalClosing * proportion;
        });
    } else { // Handle zero opening balance
         accountTypes.forEach((acc, i) => {
            newData.closingBalance[acc] = totalClosing / accountTypes.length;
        });
    }

    return newData;
  }, []);

  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem("plannerMasterData");
      const parsedMasterData = savedData ? JSON.parse(savedData) : null;
      setMasterData(parsedMasterData);

      const initialData = generateInitialYearData(activeYear, parsedMasterData);
      setYearData(runCalculations(initialData));
    } catch (error) {
      console.error("Failed to load or parse planner data:", error);
      const initialData = generateInitialYearData(activeYear, null);
      setYearData(runCalculations(initialData));
    }
  }, [activeYear, runCalculations]);
  
  const handleDailyDataChange = (month: string, dayIndex: number, field: keyof DailyLog, value: any) => {
      setYearData(prev => {
        if (!prev) return null;
        
        const newData = JSON.parse(JSON.stringify(prev)); // Deep copy
        const newLog = [...newData.monthly[month].log];
        (newLog[dayIndex] as any)[field] = value;
        newData.monthly[month].log = newLog;

        return runCalculations(newData);
      });
  };

  const handleYearChange = (year: string) => {
    setActiveYear(year);
  }

  if (!yearData) {
    return (
        <MainLayout>
          <div className="flex items-center justify-center h-full">Loading Planner Data...</div>
        </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Income Planner</h1>
          <p className="text-muted-foreground">Plan and track your trading income goals.</p>
        </div>
        
        <Card>
          <CardHeader>
              <CardTitle>Planner Setup</CardTitle>
              <CardDescription>
                  Set your initial values and targets for the year in the Planner Master Data page. These will cascade through the planner.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Link href="/planner-master-data">
                <Button>
                    Go to Planner Master Data
                </Button>
              </Link>
          </CardContent>
        </Card>

        <Tabs defaultValue={activeYear} onValueChange={handleYearChange} className="w-full">
          <TabsList>
            {fiscalYears.map(year => <TabsTrigger key={year} value={year}>{year}</TabsTrigger>)}
          </TabsList>

          <TabsContent value={activeYear} className="space-y-6">
            <Card>
              <CardHeader>
                  <CardTitle>Master Yearly Summary - {activeYear}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard title="Opening Balance" value={`$${Object.values(yearData.openingBalance).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                <StatCard title="Total Trades" value={String(yearData.totalTrades)} />
                <StatCard title="Total Withdrawals" value={`$${yearData.totalWithdrawals.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                <StatCard title="Yearly Net P/L" value={`$${yearData.yearlyNetPL.toLocaleString(undefined, {minimumFractionDigits: 2})}`} valueClassName={yearData.yearlyNetPL >= 0 ? 'text-accent' : 'text-destructive'} />
                <StatCard title="Closing Balance" value={`$${Object.values(yearData.closingBalance).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Yearly Targets</CardTitle>
                  <CardDescription>Your progress towards your annual goals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TargetBar title="Income Target" actual={yearData.yearlyNetPL} target={yearData.incomeTarget} />
                  <TargetBar title="Savings Target" actual={yearData.yearlyNetPL - yearData.totalWithdrawals} target={yearData.savingsTarget} />
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

            <MonthlyPlanner 
              yearData={yearData} 
              onDataChange={handleDailyDataChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
