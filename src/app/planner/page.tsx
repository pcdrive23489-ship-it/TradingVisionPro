
"use client"

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Wand2, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

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
    const monthly: { [key: string]: MonthlyDataForPlanner } = {};
    for (const month of months) {
      const log: DailyLog[] = Array.from({ length: 5 }, (_, i) => ({
        date: `0${i + 1} ${month}`, opening: 0, return: "0", pnl: 0, withdrawals: 0, closing: 0,
      }));
       monthly[month] = {
        log,
        withdrawals: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 },
        profitPercentage: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 }
      };
    }
    
    // This is just for initial structure, will be overwritten by master data
    const openingBalance = { ...lastYearClosing };
    data[year] = {
      openingBalance,
      closingBalance: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 },
      totalTrades: 240, // Example static value
      totalWithdrawals: 0, // Calculated
      yearlyNetPL: 0, // Calculated
      incomeTarget: 60000, // Example static value
      savingsTarget: 25000, // Example static value
      monthly,
    };
     // Placeholder for carry-over logic, actual should come from master data
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

function MonthlyPlanner({ year, yearData, onDataChange, openingBalanceForYear }: { year: string, yearData: YearlyDataForPlanner, onDataChange: (year: string, month: string, dayIndex: number, field: keyof DailyLog, value: any) => void, openingBalanceForYear: number }) {
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
    summary.netClosing = lastDay ? lastDay.closing : (monthData.log[0]?.opening || openingBalanceForYear);


    return summary;
  }, [monthData, openingBalanceForYear]);


  return (
    <Tabs defaultValue={activeMonth} onValueChange={setActiveMonth}>
      <TabsList>
        {months.map(month => <TabsTrigger key={month} value={month}>{month}</TabsTrigger>)}
      </TabsList>
      <TabsContent value={activeMonth}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{activeMonth} Trading Log</CardTitle>
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
                    {monthData.log.map((day, i) => (
                      <TableRow key={i}>
                        <TableCell>{day.date}</TableCell>
                        <TableCell>${day.opening.toLocaleString()}</TableCell>
                        <TableCell>
                           <Input 
                            type="text" 
                            value={day.return} 
                            onChange={(e) => handleInputChange(activeMonth, i, 'return', e.target.value)}
                            className="w-20"
                           />
                        </TableCell>
                        <TableCell className={day.pnl >= 0 ? "text-accent" : "text-destructive"}>
                           ${day.pnl.toLocaleString()}
                        </TableCell>
                        <TableCell>
                           <Input 
                            type="number" 
                            value={day.withdrawals} 
                            onChange={(e) => handleInputChange(activeMonth, i, 'withdrawals', e.target.value)}
                            className="w-24"
                           />
                        </TableCell>
                        <TableCell>${day.closing.toLocaleString()}</TableCell>
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
  
  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem("plannerMasterData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // We need to merge the detailed log structure from generateInitialData
        // with the master data from localStorage.
        const initialData = generateInitialData();
        for (const year in parsedData) {
          if (initialData[year]) {
            initialData[year] = {
              ...initialData[year], // Keep daily log structure
              openingBalance: parsedData[year].openingBalance,
              closingBalance: parsedData[year].closingBalance, // Will be recalculated
              monthly: {
                ...initialData[year].monthly
              }
            };
            // merge monthly profit and withdrawal from master to planner
             for (const month in parsedData[year].monthly) {
                 if(initialData[year].monthly[month]) {
                     initialData[year].monthly[month].profitPercentage = parsedData[year].monthly[month].profitPercentage;
                     initialData[year].monthly[month].withdrawals = parsedData[year].monthly[month].withdrawals;
                 }
             }
          }
        }
        setPlannerData(initialData);
        recalculateAll(initialData, setPlannerData);
      } else {
        setPlannerData(generateInitialData());
      }
    } catch (error) {
      console.error("Failed to load or parse planner data:", error);
      setPlannerData(generateInitialData());
    }
  }, []);
  
  const recalculateAll = (currentData: PlannerData, setter: React.Dispatch<React.SetStateAction<PlannerData | null>>) => {
     setter(prev => {
        if (!prev) return null;
        const newData = { ...prev };

        for (const year of fiscalYears) {
            let yearlyNetPL = 0;
            let totalWithdrawals = 0;
            let lastMonthClosing = Object.values(newData[year].openingBalance).reduce((a, b) => a + b, 0);

            for (const month of months) {
                let lastDayClosing = lastMonthClosing;
                
                const profitPerc = Object.values(newData[year].monthly[month].profitPercentage).reduce((a, b) => a + b, 0) / (accountTypes.length || 1);
                const monthWithdrawals = Object.values(newData[year].monthly[month].withdrawals).reduce((a, b) => a + b, 0);

                // Distribute profit/withdrawal over log days for simplicity
                const dailyReturn = (profitPerc / newData[year].monthly[month].log.length).toFixed(2);
                const dailyWithdrawal = parseFloat((monthWithdrawals / newData[year].monthly[month].log.length).toFixed(2));

                newData[year].monthly[month].log.forEach((day, dayIndex) => {
                    day.opening = lastDayClosing;
                    day.return = String(dailyReturn);
                    day.pnl = parseFloat(((day.opening * parseFloat(dailyReturn)) / 100).toFixed(2));
                    day.withdrawals = dailyWithdrawal;
                    day.closing = day.opening + day.pnl - day.withdrawals;
                    lastDayClosing = day.closing;

                    yearlyNetPL += day.pnl;
                    totalWithdrawals += day.withdrawals;
                });
                lastMonthClosing = lastDayClosing;
            }

            newData[year].yearlyNetPL = yearlyNetPL;
            newData[year].totalWithdrawals = totalWithdrawals;

            const totalOpening = Object.values(newData[year].openingBalance).reduce((a, b) => a + b, 0);
            const totalClosing = totalOpening + yearlyNetPL - totalWithdrawals;

            // Simplified closing balance distribution
            accountTypes.forEach((acc, i) => {
                const proportion = (newData[year].openingBalance[acc] || 0) / totalOpening || (1 / accountTypes.length);
                newData[year].closingBalance[acc] = totalClosing * proportion;
            });
            
             // Carry forward to next year
            if (fiscalYears.indexOf(year) + 1 < fiscalYears.length) {
                const nextYear = fiscalYears[fiscalYears.indexOf(year) + 1];
                if(newData[nextYear]){
                   newData[nextYear].openingBalance = {...newData[year].closingBalance};
                }
            }
        }
        return newData;
     });
  };

  const handleDailyDataChange = (year: string, month: string, dayIndex: number, field: keyof DailyLog, value: any) => {
      setPlannerData(prev => {
        if (!prev) return null;
        const newData = { ...prev };
        const newLog = [...newData[year].monthly[month].log];
        const openingBalanceForMonth = dayIndex === 0 
            ? (months.indexOf(month) === 0 
                ? Object.values(newData[year].openingBalance).reduce((a, b) => a + b, 0)
                : newData[year].monthly[months[months.indexOf(month)-1]].log[4].closing
              )
            : newLog[dayIndex - 1].closing;

        // Update the specific field
        (newLog[dayIndex] as any)[field] = value;

        // Recalculate based on changes
        for (let i = dayIndex; i < newLog.length; i++) {
          const currentDay = newLog[i];
          const prevDayClosing = i === 0 ? openingBalanceForMonth : newLog[i - 1].closing;

          currentDay.opening = prevDayClosing;
          
          if (field === 'return' && i === dayIndex) {
            const returnPercent = parseFloat(value) || 0;
            currentDay.pnl = parseFloat(((currentDay.opening * returnPercent) / 100).toFixed(2));
          } else if (field === 'withdrawals' && i === dayIndex) {
             currentDay.withdrawals = parseFloat(value) || 0;
          }

          currentDay.closing = currentDay.opening + currentDay.pnl - currentDay.withdrawals;
        }

        newData[year].monthly[month].log = newLog;
        
        // This is a simplified recalculation. A full recalculation might be needed.
        recalculateAll(newData, setPlannerData);

        return newData;
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
  const openingBalanceForYear = Object.values(currentYearData.openingBalance).reduce((a,b) => a+b, 0);
  
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
                  <StatCard title="Opening Balance" value={`$${Object.values(plannerData[year].openingBalance).reduce((a, b) => a + b, 0).toLocaleString()}`} />
                  <StatCard title="Total Trades" value={String(plannerData[year].totalTrades)} />
                  <StatCard title="Total Withdrawals" value={`$${plannerData[year].totalWithdrawals.toLocaleString()}`} />
                  <StatCard title="Yearly Net P/L" value={`$${plannerData[year].yearlyNetPL.toLocaleString()}`} valueClassName={plannerData[year].yearlyNetPL >= 0 ? 'text-accent' : 'text-destructive'} />
                  <StatCard title="Closing Balance" value={`$${Object.values(plannerData[year].closingBalance).reduce((a, b) => a + b, 0).toLocaleString()}`} />
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
                openingBalanceForYear={openingBalanceForYear}
              />

            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  )
}
