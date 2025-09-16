
"use client"

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Loader2, Wand2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getDaysInMonth, format } from "date-fns"
import type { YearlyData as PlannerYearlyData, PlannerMasterDataState } from "@/lib/planner-calculations"
import { AreaChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Legend, ResponsiveContainer } from "recharts"

const fiscalYears = ["FY25", "FY26", "FY27", "FY28", "FY29", "FY30"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const accountTypes = ["Forex Trading", "Online", "Indian Market"];

// --- Data Types ---
interface DailyLog {
  date: string;
  opening: number;
  return: number; // This will be an input from master data
  pnl: number;
  withdrawals: number;
  closing: number;
}

interface MonthlyDataForPlanner {
  log: DailyLog[];
  // These are targets/inputs from master data, not calculated values
  withdrawalsTarget: number;
  profitPercentageTarget: number;
}

interface YearlyDataForPlanner {
  openingBalance: number;
  closingBalance: number;
  totalTrades: number; // This seems static, can be refined
  totalWithdrawals: number;
  yearlyNetPL: number;
  incomeTarget: number; // From master data
  savingsTarget: number; // From master data
  monthly: { [key: string]: MonthlyDataForPlanner };
}


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

function MonthlyPlanner({ yearData, onDataChange, accountType }: { yearData: YearlyDataForPlanner, onDataChange: (month: string, dayIndex: number, field: keyof DailyLog, value: any) => void, accountType: string }) {
  const [activeMonth, setActiveMonth] = React.useState(months[0]);
  
  const handleInputChange = (month: string, dayIndex: number, field: keyof DailyLog, value: string) => {
    // This function is now a placeholder as real-time editing is complex.
    // Changes should be made in the master data page to trigger recalculations.
    console.log("Changes to daily log should be made via the master data page to trigger recalculations.");
  };

  const monthData = yearData.monthly[activeMonth];

  const monthlySummary = React.useMemo(() => {
    if (!monthData) return { totalPL: 0, totalWithdrawals: 0, winPercentage: 0, totalTrades: 0, netClosing: 0 };
    
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
    summary.netClosing = lastDay ? lastDay.closing : yearData.openingBalance;

    return summary;
  }, [monthData, yearData.openingBalance]);


  return (
    <Tabs defaultValue={activeMonth} onValueChange={setActiveMonth}>
      <TabsList className="overflow-x-auto h-auto">
        {months.map(month => <TabsTrigger key={month} value={month}>{month}</TabsTrigger>)}
      </TabsList>
      {monthData && (
        <TabsContent value={activeMonth}>
            <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                <CardHeader>
                    <CardTitle>{activeMonth} Trading Log - {accountType}</CardTitle>
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
                                    type="number" 
                                    defaultValue={day.return}
                                    readOnly
                                    className="w-20"
                                />
                            </TableCell>
                            <TableCell className={day.pnl >= 0 ? "text-accent" : "text-destructive"}>
                                ${day.pnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </TableCell>
                            <TableCell>
                                <Input 
                                    type="number" 
                                    defaultValue={day.withdrawals}
                                    readOnly
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
                    <p className="text-2xl font-bold">${monthlySummary.netClosing.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
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
      )}
    </Tabs>
  )
}

// --- NEW SELF-CONTAINED CALCULATION ENGINE ---
const runCalculationsForYear = (yearData: PlannerYearlyData, year: string): Record<string, YearlyDataForPlanner> => {
    const calculatedData: Record<string, YearlyDataForPlanner> = {};
    const numericYear = 2000 + parseInt(year.substring(2));

    accountTypes.forEach(accType => {
        let lastYearClosing = yearData.openingBalance[accType] || 0;
        
        // Find opening balance from previous year if not the first year
        // This is simplified here. The master data page should handle this propagation.
        // For this page, we rely on the openingBalance provided in the master data for the year.
        
        const accYearlyData: YearlyDataForPlanner = {
            openingBalance: yearData.openingBalance[accType] || 0,
            closingBalance: 0,
            totalTrades: 240, // Static for now
            totalWithdrawals: 0,
            yearlyNetPL: 0,
            incomeTarget: yearData.incomeTarget,
            savingsTarget: yearData.savingsTarget,
            monthly: {},
        };

        let lastMonthClosing = accYearlyData.openingBalance;

        months.forEach((month, monthIndex) => {
            const masterMonthData = yearData.monthly[month];
            const daysInMonth = getDaysInMonth(new Date(numericYear, monthIndex));
            const log: DailyLog[] = [];
            let lastDayClosing = lastMonthClosing;

            const profitPercentageTarget = masterMonthData.profitPercentage[accType] || 0;
            const withdrawalsTarget = masterMonthData.withdrawals[accType] || 0;
            
            const tradingDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(numericYear, monthIndex, i + 1))
                                            .filter(d => d.getDay() > 0 && d.getDay() < 6).length;
            
            const dailyWithdrawal = tradingDaysInMonth > 0 ? withdrawalsTarget / tradingDaysInMonth : 0;
            
            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(numericYear, monthIndex, i);
                if (date.getDay() > 0 && date.getDay() < 6) { // Weekdays only
                    const opening = lastDayClosing;
                    const pnl = (opening * profitPercentageTarget) / 100;
                    const closing = opening + pnl - dailyWithdrawal;
                    log.push({
                        date: format(date, "dd-MMM"),
                        opening,
                        return: profitPercentageTarget,
                        pnl,
                        withdrawals: dailyWithdrawal,
                        closing,
                    });
                    lastDayClosing = closing;
                }
            }
            
            accYearlyData.monthly[month] = {
                log,
                profitPercentageTarget,
                withdrawalsTarget
            };

            if (log.length > 0) {
              lastMonthClosing = log[log.length - 1].closing;
            }
        });

        accYearlyData.closingBalance = lastMonthClosing;
        accYearlyData.yearlyNetPL = Object.values(accYearlyData.monthly).reduce((total, m) => total + m.log.reduce((pnlSum, day) => pnlSum + day.pnl, 0), 0);
        accYearlyData.totalWithdrawals = Object.values(accYearlyData.monthly).reduce((total, m) => total + m.log.reduce((wSum, day) => wSum + day.withdrawals, 0), 0);
        
        calculatedData[accType] = accYearlyData;
    });

    return calculatedData;
};


export default function PlannerPage() {
  const [plannerMasterData, setPlannerMasterData] = React.useState<PlannerMasterDataState | null>(null);
  const [activeYear, setActiveYear] = React.useState(fiscalYears[0]);
  const [activeAccountType, setActiveAccountType] = React.useState(accountTypes[0]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // This state holds the calculated data for the active year
  const [activeYearCalculatedData, setActiveYearCalculatedData] = React.useState<Record<string, YearlyDataForPlanner> | null>(null);

  // Load master data from localStorage on initial render
  React.useEffect(() => {
    setIsLoading(true);
    try {
      const savedData = localStorage.getItem("plannerMasterData");
      if (savedData) {
        setPlannerMasterData(JSON.parse(savedData));
      } else {
        console.log("No planner master data found. Please create it first via the Master Data page.");
      }
    } catch (error) {
      console.error("Failed to load planner master data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-calculate when master data or active year changes
  React.useEffect(() => {
    if (plannerMasterData && plannerMasterData[activeYear]) {
        const yearMasterData = plannerMasterData[activeYear];
        const calculatedData = runCalculationsForYear(yearMasterData, activeYear);
        setActiveYearCalculatedData(calculatedData);
    }
  }, [plannerMasterData, activeYear]);


  const { yearlySummary, visualizationData } = React.useMemo(() => {
    const summary = {
        totalOpeningBalance: 0,
        totalClosingBalance: 0,
        totalYearlyNetPL: 0,
        totalWithdrawals: 0,
        incomeTarget: 0,
        savingsTarget: 0,
        totalTrades: 0,
    };

    const balanceData: { month: string, [key: string]: number | string }[] = [];
    const pnlData: { month: string, netPnl: number, withdrawals: number }[] = [];

    if (!activeYearCalculatedData) {
        return { yearlySummary: summary, visualizationData: { balanceData, pnlData } };
    }

    const firstAccountData = activeYearCalculatedData[accountTypes[0]];
    if(firstAccountData) {
      summary.incomeTarget = firstAccountData.incomeTarget;
      summary.savingsTarget = firstAccountData.savingsTarget;
      summary.totalTrades = firstAccountData.totalTrades;
    }

    accountTypes.forEach(accType => {
        const data = activeYearCalculatedData[accType];
        if (data) {
            summary.totalOpeningBalance += data.openingBalance || 0;
            summary.totalClosingBalance += data.closingBalance || 0;
            summary.totalYearlyNetPL += data.yearlyNetPL || 0;
            summary.totalWithdrawals += data.totalWithdrawals || 0;
        }
    });

    months.forEach(month => {
      const monthBalanceEntry: { month: string, [key: string]: number | string } = { month };
      let monthNetPnl = 0;
      let monthWithdrawals = 0;

      accountTypes.forEach(accType => {
        const monthLogs = activeYearCalculatedData[accType]?.monthly[month]?.log;
        const closing = (monthLogs && monthLogs.length > 0) ? monthLogs[monthLogs.length - 1].closing : (activeYearCalculatedData[accType]?.monthly[month] ? activeYearCalculatedData[accType]!.openingBalance : 0);
        monthBalanceEntry[accType] = closing;

        if (monthLogs) {
          monthNetPnl += monthLogs.reduce((sum, day) => sum + day.pnl, 0);
          monthWithdrawals += monthLogs.reduce((sum, day) => sum + day.withdrawals, 0);
        }
      });

      balanceData.push(monthBalanceEntry);
      pnlData.push({ month, netPnl: monthNetPnl, withdrawals: monthWithdrawals });
    });

    return { yearlySummary: summary, visualizationData: { balanceData, pnlData } };
  }, [activeYearCalculatedData]);
  
  if (isLoading) {
    return (
        <MainLayout>
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </MainLayout>
    );
  }
  
  const currentAccountPlannerData = activeYearCalculatedData ? activeYearCalculatedData[activeAccountType] : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Income Planner</h1>
          <p className="text-muted-foreground">Plan and track your trading income goals.</p>
        </div>
        
        {!plannerMasterData && (
          <Card>
            <CardHeader>
                <CardTitle>Planner Setup Required</CardTitle>
                <CardDescription>
                    No planner data found. Please go to the Planner Master Data page to set your initial values and targets for the year.
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
        )}

        {plannerMasterData && (
          <Tabs defaultValue={activeYear} onValueChange={setActiveYear} className="w-full">
            <TabsList>
              {fiscalYears.map(year => <TabsTrigger key={year} value={year}>{year}</TabsTrigger>)}
            </TabsList>

            <TabsContent value={activeYear} className="space-y-6">
              {!activeYearCalculatedData ? (
                  <Card>
                      <CardContent className="pt-6 text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="mt-2 text-muted-foreground">Calculating data for {activeYear}...</p>
                      </CardContent>
                  </Card>
              ): (
                  <>
                      <Card>
                          <CardHeader>
                              <CardTitle>Master Yearly Summary - {activeYear}</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <StatCard title="Opening Balance" value={`$${yearlySummary.totalOpeningBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                          <StatCard title="Total Trades" value={String(yearlySummary.totalTrades)} />
                          <StatCard title="Total Withdrawals" value={`$${yearlySummary.totalWithdrawals.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                          <StatCard title="Yearly Net P/L" value={`$${yearlySummary.totalYearlyNetPL.toLocaleString(undefined, {minimumFractionDigits: 2})}`} valueClassName={yearlySummary.totalYearlyNetPL >= 0 ? 'text-accent' : 'text-destructive'} />
                          <StatCard title="Closing Balance" value={`$${yearlySummary.totalClosingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
                          </CardContent>
                      </Card>

                      <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                          <CardHeader>
                          <CardTitle>Yearly Targets</CardTitle>
                          <CardDescription>Your progress towards your annual goals.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                          <TargetBar title="Income Target" actual={yearlySummary.totalYearlyNetPL} target={yearlySummary.incomeTarget} />
                          <TargetBar title="Savings Target" actual={yearlySummary.totalYearlyNetPL - yearlySummary.totalWithdrawals} target={yearlySummary.savingsTarget} />
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader>
                          <CardTitle>Visualizations</CardTitle>
                          <CardDescription>Projected growth and cash flow analysis.</CardDescription>
                          </CardHeader>
                          <CardContent className="h-[250px] flex flex-col">
                          <Tabs defaultValue="balance">
                              <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="balance">Balance Growth</TabsTrigger>
                                  <TabsTrigger value="pnl">P/L vs Withdrawals</TabsTrigger>
                              </TabsList>
                              <TabsContent value="balance" className="flex-1 -mx-4">
                              <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={visualizationData.balanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                      <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                                      <Tooltip formatter={(value: number, name: string) => [`$${value.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`, name.replace(/([A-Z])/g, ' $1').trim()]}/>
                                      <Legend />
                                      <Area type="monotone" dataKey="Forex Trading" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" />
                                      <Area type="monotone" dataKey="Online" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" />
                                      <Area type="monotone" dataKey="Indian Market" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" />
                                  </AreaChart>
                              </ResponsiveContainer>
                              </TabsContent>
                              <TabsContent value="pnl" className="flex-1 -mx-4">
                                  <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={visualizationData.pnlData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false}/>
                                          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`}/>
                                          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`}/>
                                          <Legend />
                                          <Bar dataKey="netPnl" fill="hsl(var(--accent))" name="Net P/L" />
                                          <Bar dataKey="withdrawals" fill="hsl(var(--primary))" name="Withdrawals" />
                                      </BarChart>
                                  </ResponsiveContainer>
                              </TabsContent>
                          </Tabs>
                          </CardContent>
                      </Card>
                      </div>
                      
                      <Tabs value={activeAccountType} onValueChange={setActiveAccountType}>
                      <TabsList>
                          {accountTypes.map(acc => <TabsTrigger key={acc} value={acc}>{acc}</TabsTrigger>)}
                      </TabsList>
                      {accountTypes.map(acc => (
                          <TabsContent key={acc} value={acc}>
                              {currentAccountPlannerData ? (
                                  <MonthlyPlanner 
                                      yearData={currentAccountPlannerData} 
                                      onDataChange={() => {}} // Pass a dummy function
                                      accountType={acc}
                                  />
                              ) : (
                                  <div className="flex items-center justify-center p-8">
                                      <Loader2 className="h-6 w-6 animate-spin" />
                                  </div>
                              )}
                          </TabsContent>
                      ))}
                      </Tabs>
                  </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  )
}

    