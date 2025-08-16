
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

interface PlannerData {
  [key: string]: YearlyDataForPlanner;
}

// --- Initial State ---
const generateInitialData = (): PlannerData => {
  const data: PlannerData = {};
  let lastYearClosing = { "Forex Trading": 60000, "Online": 12000, "Indian Market": 8000 };

  for (const year of fiscalYears) {
    const numericYear = 2000 + parseInt(year.substring(2));
    const monthly: { [key: string]: MonthlyDataForPlanner } = {};
    
    months.forEach((month, monthIndex) => {
      const daysInMonth = getDaysInMonth(new Date(numericYear, monthIndex));
      const log: DailyLog[] = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(numericYear, monthIndex, i);
        // Assuming trading happens only on weekdays
        if (date.getDay() > 0 && date.getDay() < 6) {
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

      monthly[month] = {
        log,
        withdrawals: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 },
        profitPercentage: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 }
      };
    });
    
    const openingBalance = { ...lastYearClosing };
    data[year] = {
      openingBalance,
      closingBalance: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 },
      totalTrades: 240, 
      totalWithdrawals: 0,
      yearlyNetPL: 0,
      incomeTarget: 60000,
      savingsTarget: 25000,
      monthly,
    };
    lastYearClosing = { "Forex Trading": 0, "Online": 0, "Indian Market": 0 };
  }
  return data;
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

function MonthlyPlanner({ year, yearData, onDataChange }: { year: string, yearData: YearlyDataForPlanner, onDataChange: (year: string, month: string, dayIndex: number, field: keyof DailyLog, value: any) => void }) {
  const [activeMonth, setActiveMonth] = React.useState(months[0]);
  
  const handleInputChange = (month: string, dayIndex: number, field: keyof DailyLog, value: string) => {
    onDataChange(year, month, dayIndex, field, value);
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
  const [plannerData, setPlannerData] = React.useState<PlannerData | null>(null);
  const [activeYear, setActiveYear] = React.useState(fiscalYears[0]);
  
  // Recalculate everything.
  const runCalculations = React.useCallback((data: PlannerData): PlannerData => {
    const newData = { ...data };

    for (const year of fiscalYears) {
        let yearlyNetPL = 0;
        let yearlyTotalWithdrawals = 0;
        let lastMonthClosing = Object.values(newData[year].openingBalance).reduce((a, b) => a + b, 0);

        for (const month of months) {
            let lastDayClosing = lastMonthClosing;
            const monthData = newData[year].monthly[month];
            
            monthData.log.forEach(day => {
                day.opening = lastDayClosing;
                const returnPercent = parseFloat(day.return) || 0;
                day.pnl = parseFloat(((day.opening * returnPercent) / 100).toFixed(2));
                // ensure withdrawals is a number
                day.withdrawals = Number(day.withdrawals) || 0;
                day.closing = day.opening + day.pnl - day.withdrawals;

                yearlyNetPL += day.pnl;
                yearlyTotalWithdrawals += day.withdrawals;
                lastDayClosing = day.closing;
            });
            lastMonthClosing = lastDayClosing;
        }

        newData[year].yearlyNetPL = yearlyNetPL;
        newData[year].totalWithdrawals = yearlyTotalWithdrawals;

        const totalOpening = Object.values(newData[year].openingBalance).reduce((a, b) => a + b, 0);
        const totalClosing = totalOpening + yearlyNetPL - yearlyTotalWithdrawals;

        // Simplified closing balance distribution
        if (totalOpening > 0) {
            accountTypes.forEach((acc) => {
                const proportion = (newData[year].openingBalance[acc] || 0) / totalOpening;
                newData[year].closingBalance[acc] = totalClosing * proportion;
            });
        } else { // Handle zero opening balance
             accountTypes.forEach((acc, i) => {
                newData[year].closingBalance[acc] = totalClosing / accountTypes.length;
            });
        }
        
         // Carry forward to next year
        const nextYearIndex = fiscalYears.indexOf(year) + 1;
        if (nextYearIndex < fiscalYears.length) {
            const nextYear = fiscalYears[nextYearIndex];
            if(newData[nextYear]){
               newData[nextYear].openingBalance = {...newData[year].closingBalance};
            }
        }
    }
    return newData;
  }, []);

  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem("plannerMasterData");
      let initialData = generateInitialData();
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        for (const year in parsedData) {
          if (initialData[year]) {
            initialData[year].openingBalance = parsedData[year].openingBalance;
            initialData[year].incomeTarget = parsedData[year].incomeTarget || 60000;
            initialData[year].savingsTarget = parsedData[year].savingsTarget || 25000;

            for (const month in parsedData[year].monthly) {
                 if(initialData[year].monthly[month]) {
                     const monthProfitPerc = parsedData[year].monthly[month].profitPercentage;
                     const monthWithdrawals = parsedData[year].monthly[month].withdrawals;
                     const tradingDays = initialData[year].monthly[month].log.length;
                     
                     if (tradingDays > 0) {
                        // Distribute monthly values across daily logs
                        const totalMonthlyProfitPerc = Object.values(monthProfitPerc).reduce((a,b) => a+b, 0) / (accountTypes.length || 1);
                        const totalMonthlyWithdrawal = Object.values(monthWithdrawals).reduce((a,b) => a+b, 0);

                        initialData[year].monthly[month].log.forEach(day => {
                            day.return = (totalMonthlyProfitPerc / tradingDays).toFixed(2);
                            day.withdrawals = parseFloat((totalMonthlyWithdrawal / tradingDays).toFixed(2));
                        });
                     }
                 }
             }
          }
        }
      }
      setPlannerData(runCalculations(initialData));
    } catch (error) {
      console.error("Failed to load or parse planner data:", error);
      setPlannerData(generateInitialData());
    }
  }, [runCalculations]);
  
  const handleDailyDataChange = (year: string, month: string, dayIndex: number, field: keyof DailyLog, value: any) => {
      setPlannerData(prev => {
        if (!prev) return null;
        
        const newData = { ...prev };
        const newLog = [...newData[year].monthly[month].log];
        (newLog[dayIndex] as any)[field] = value;
        newData[year].monthly[month].log = newLog;

        return runCalculations(newData);
      });
  };

  if (!plannerData) {
    return (
        <MainLayout>
          <div className="flex items-center justify-center h-full">Loading Planner Data...</div>
        </MainLayout>
    );
  }

  const currentYearData = plannerData[activeYear];
  
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

        <Tabs defaultValue={activeYear} onValueChange={setActiveYear} className="w-full">
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
                  <StatCard title="Opening Balance" value={`$${Object.values(plannerData[year].openingBalance).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                  <StatCard title="Total Trades" value={String(plannerData[year].totalTrades)} />
                  <StatCard title="Total Withdrawals" value={`$${plannerData[year].totalWithdrawals.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                  <StatCard title="Yearly Net P/L" value={`$${plannerData[year].yearlyNetPL.toLocaleString(undefined, {minimumFractionDigits: 2})}`} valueClassName={plannerData[year].yearlyNetPL >= 0 ? 'text-accent' : 'text-destructive'} />
                  <StatCard title="Closing Balance" value={`$${Object.values(plannerData[year].closingBalance).reduce((a, b) => a + b, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Yearly Targets</CardTitle>
                    <CardDescription>Your progress towards your annual goals.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TargetBar title="Income Target" actual={plannerData[year].yearlyNetPL} target={plannerData[year].incomeTarget} />
                    <TargetBar title="Savings Target" actual={plannerData[year].yearlyNetPL - plannerData[year].totalWithdrawals} target={plannerData[year].savingsTarget} />
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
                year={year} 
                yearData={plannerData[year]} 
                onDataChange={handleDailyDataChange}
              />

            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  )
}

    