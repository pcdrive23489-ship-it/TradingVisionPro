
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

interface MonthlyData {
  log: DailyLog[];
  withdrawals: Record<string, number>;
  profitPercentage: Record<string, number>;
}

interface YearlyData {
  openingBalance: Record<string, number>;
  closingBalance: Record<string, number>;
  totalTrades: number;
  totalWithdrawals: number;
  yearlyNetPL: number;
  incomeTarget: number;
  savingsTarget: number;
  monthly: { [key: string]: MonthlyData };
}

interface PlannerData {
  [key: string]: YearlyData;
}

// --- Initial State ---
const generateInitialData = (): PlannerData => {
  const data: PlannerData = {};
  let lastYearClosing = { "Forex Trading": 60000, "Online": 12000, "Indian Market": 8000 };

  for (const year of fiscalYears) {
    const monthly: { [key: string]: MonthlyData } = {};
    for (const month of months) {
      const log: DailyLog[] = Array.from({ length: 5 }, (_, i) => ({
        date: `0${i + 1} ${month}`, opening: 0, return: "0", pnl: 0, withdrawals: 0, closing: 0,
      }));
       monthly[month] = {
        log,
        withdrawals: { "Forex trading": 0, "Online": 0, "Indian market": 0 },
        profitPercentage: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 }
      };
    }

    const openingBalance = { ...lastYearClosing };
    data[year] = {
      openingBalance,
      closingBalance: { "Forex Trading": 10000, "Online": 5000, "Indian Market": 10000 },
      totalTrades: 240,
      totalWithdrawals: 15000,
      yearlyNetPL: 50000,
      incomeTarget: 60000,
      savingsTarget: 25000,
      monthly,
    };
    // Placeholder for carry-over logic
    lastYearClosing = { "Forex Trading": 135000, "Online": 0, "Indian Market": 0 };
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

function MonthlyPlanner({ year, yearData, onDataChange }: { year: string, yearData: YearlyData, onDataChange: (year: string, month: string, dayIndex: number, field: keyof DailyLog, value: any) => void }) {
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
    const openingBalanceForMonth = Object.values(yearData.openingBalance).reduce((a,b) => a+b, 0)
    const lastDay = monthData.log[monthData.log.length - 1];
    summary.netClosing = lastDay ? lastDay.closing : (monthData.log[0]?.opening || openingBalanceForMonth);

    return summary;
  }, [monthData, yearData.openingBalance]);


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

function PlannerMasterData({ year, yearData, onMasterDataChange, onSave }: { year: string, yearData: YearlyData, onMasterDataChange: (year: string, section: string, key: string, value: number, month?: string) => void, onSave: () => void }) {
    const handleBalanceChange = (field: string, value: string) => {
        onMasterDataChange(year, 'openingBalance', field, parseFloat(value) || 0);
    }

    const handleProfitChange = (month: string, field: string, value: string) => {
        onMasterDataChange(year, 'profit', field, parseFloat(value) || 0, month);
    }
    
    const handleWithdrawalChange = (month: string, field: string, value: string) => {
        onMasterDataChange(year, 'withdrawal', field, parseFloat(value) || 0, month);
    }

    const totalWithdrawals = React.useMemo(() => {
        const totals: Record<string, number> = { "Forex trading": 0, "Online": 0, "Indian market": 0, "Total": 0 };
        months.forEach(month => {
            Object.keys(yearData.monthly.Jan.withdrawals).forEach(accType => {
                 totals[accType] += yearData.monthly[month].withdrawals[accType] || 0;
            });
        });
        totals.Total = Object.values(totals).reduce((a,b) => a+b, 0);
        return totals;
    }, [yearData]);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    Planner Master Data - {year}
                    <Button size="sm" onClick={onSave}><Edit className="mr-2 h-4 w-4" /> Save</Button>
                </CardTitle>
                <CardDescription>Set your initial values and targets for the year. These will cascade through the planner.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Withdrawals Table */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Withdrawals</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                {Object.keys(yearData.monthly.Jan.withdrawals).map(accType => <TableHead key={accType}>{accType}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {months.map(month => (
                                <TableRow key={month}>
                                    <TableCell className="font-medium">{month}-{year.substring(2)}</TableCell>
                                    {Object.keys(yearData.monthly[month].withdrawals).map(accType => (
                                        <TableCell key={accType}>
                                            <Input
                                                type="number"
                                                className="w-24"
                                                value={yearData.monthly[month].withdrawals[accType]}
                                                onChange={(e) => handleWithdrawalChange(month, accType, e.target.value)}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            <TableRow className="font-bold bg-muted/50">
                                <TableCell>Total</TableCell>
                                {Object.keys(totalWithdrawals).map(key => key !== 'Total' && <TableCell key={key}>${totalWithdrawals[key].toLocaleString()}</TableCell>)}
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Balances and Profits */}
                <div className="space-y-8">
                    {/* Balances */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Opening & Closing Balances</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Opening</TableHead>
                                    <TableHead>Closing</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accountTypes.map(acc => (
                                    <TableRow key={acc}>
                                        <TableCell className="font-medium">{acc}</TableCell>
                                        <TableCell>
                                            <Input type="number" className="w-28" value={yearData.openingBalance[acc] || 0} onChange={e => handleBalanceChange(acc, e.target.value)} />
                                        </TableCell>
                                        <TableCell>${(yearData.closingBalance[acc] || 0).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                </div>

                {/* Profit % Table */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Profit %</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                {accountTypes.map(accType => <TableHead key={accType}>{accType}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {months.map(month => (
                                <TableRow key={month}>
                                    <TableCell className="font-medium">{month}-{year.substring(2)}</TableCell>
                                    {accountTypes.map(accType => (
                                        <TableCell key={accType}>
                                            <Input
                                                type="number"
                                                placeholder="%"
                                                className="w-20"
                                                value={yearData.monthly[month].profitPercentage[accType]}
                                                onChange={(e) => handleProfitChange(month, accType, e.target.value)}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

            </CardContent>
        </Card>
    )
}


export default function PlannerPage() {
  const [plannerData, setPlannerData] = React.useState(generateInitialData);
  
  const handleMasterDataChange = (year: string, section: string, key: string, value: number, month?: string) => {
    setPlannerData(prev => {
        const newData = { ...prev };
        if (section === 'openingBalance') {
            newData[year].openingBalance[key] = value;
        } else if (month) {
            if (section === 'profit') {
                 newData[year].monthly[month].profitPercentage[key] = value;
            } else if (section === 'withdrawal') {
                 newData[year].monthly[month].withdrawals[key] = value;
            }
        }
        return newData;
    });
  };
  
  const handleDailyDataChange = (year: string, month: string, dayIndex: number, field: keyof DailyLog, value: any) => {
      setPlannerData(prev => {
        const newData = { ...prev };
        const newLog = [...newData[year].monthly[month].log];
        const openingBalanceForYear = Object.values(newData[year].openingBalance).reduce((a,b) => a+b, 0);
        
        // Update the specific field
        (newLog[dayIndex] as any)[field] = value;

        // Recalculate based on changes
        for (let i = 0; i < newLog.length; i++) {
          const currentDay = newLog[i];
          const prevDayClosing = i === 0 ? openingBalanceForYear : newLog[i - 1].closing;

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

        // Recalculate yearly summary
        let yearlyNetPL = 0;
        let totalWithdrawals = 0;
        Object.values(newData[year].monthly).forEach(m => {
            m.log.forEach(d => {
                yearlyNetPL += d.pnl;
                totalWithdrawals += d.withdrawals;
            })
        });
        const lastMonth = months[months.length - 1];
        const lastDayOfMonth = newData[year].monthly[lastMonth].log.length - 1;
        const finalClosingBalance = newData[year].monthly[lastMonth].log[lastDayOfMonth].closing;

        newData[year].yearlyNetPL = yearlyNetPL;
        newData[year].totalWithdrawals = totalWithdrawals;

        // Simplified closing balance logic for now
        const closingForex = (newData[year].openingBalance['Forex Trading'] || 0) + yearlyNetPL - (totalWithdrawals / 3);
        newData[year].closingBalance['Forex Trading'] = closingForex;


        return newData;
      });
  };

  const handleSaveChanges = () => {
    // Here you would typically save to a backend/localStorage
    console.log("Saving planner data:", plannerData);
    alert("Planner data saved to console!");
  }

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
              
              <PlannerMasterData 
                year={year} 
                yearData={plannerData[year]}
                onMasterDataChange={handleMasterDataChange}
                onSave={handleSaveChanges}
              />
                
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

              <MonthlyPlanner year={year} yearData={plannerData[year]} onDataChange={handleDailyDataChange} />

            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  )
}
