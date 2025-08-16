
"use client"

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";


const fiscalYears = ["FY25", "FY26", "FY27", "FY28", "FY29", "FY30"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const accountTypes = ["Forex Trading", "Online", "Indian Market"];

// --- Data Types ---
interface MonthlyData {
  withdrawals: Record<string, number>;
  profitPercentage: Record<string, number>;
}

interface YearlyData {
  openingBalance: Record<string, number>;
  closingBalance: Record<string, number>;
  monthly: { [key: string]: MonthlyData };
}

interface PlannerMasterDataState {
  [key: string]: YearlyData;
}

// --- Initial State ---
const generateInitialData = (): PlannerMasterDataState => {
  const data: PlannerMasterDataState = {};
  let lastYearClosing = { "Forex Trading": 60000, "Online": 12000, "Indian Market": 8000 };

  for (const year of fiscalYears) {
    const monthly: { [key: string]: MonthlyData } = {};
    for (const month of months) {
       monthly[month] = {
        withdrawals: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 },
        profitPercentage: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 }
      };
    }

    const openingBalance = { ...lastYearClosing };
    data[year] = {
      openingBalance,
      closingBalance: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 }, // Will be calculated in planner
      monthly,
    };
    // Placeholder for carry-over logic for next year's opening
    lastYearClosing = { "Forex Trading": 0, "Online": 0, "Indian Market": 0 };
  }
  return data;
};


function PlannerMasterDataForm({ year, yearData, onMasterDataChange, onSave }: { year: string, yearData: YearlyData, onMasterDataChange: (year: string, section: string, key: string, value: number, month?: string) => void, onSave: () => void }) {
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
        const totals: Record<string, number> = { "Forex Trading": 0, "Online": 0, "Indian Market": 0, "Total": 0 };
        months.forEach(month => {
            accountTypes.forEach(accType => {
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
                    <Button size="sm" onClick={onSave}><Edit className="mr-2 h-4 w-4" /> Save Changes</Button>
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
                                                className="w-24"
                                                value={yearData.monthly[month].withdrawals[accType] || 0}
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
                        <h3 className="font-semibold text-lg">Opening Balances</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Opening</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accountTypes.map(acc => (
                                    <TableRow key={acc}>
                                        <TableCell className="font-medium">{acc}</TableCell>
                                        <TableCell>
                                            <Input type="number" className="w-28" value={yearData.openingBalance[acc] || 0} onChange={e => handleBalanceChange(acc, e.target.value)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                </div>

                {/* Profit % Table */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Target Profit %</h3>
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
                                                value={yearData.monthly[month].profitPercentage[accType] || 0}
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


export default function PlannerMasterDataPage() {
  const [plannerData, setPlannerData] = React.useState<PlannerMasterDataState | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem("plannerMasterData");
      if (savedData) {
        setPlannerData(JSON.parse(savedData));
      } else {
        setPlannerData(generateInitialData());
      }
    } catch (error) {
      console.error("Failed to load or parse master data:", error);
      setPlannerData(generateInitialData());
    }
  }, []);

  
  const handleMasterDataChange = (year: string, section: string, key: string, value: number, month?: string) => {
    setPlannerData(prev => {
        if (!prev) return null;
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

  const handleSaveChanges = () => {
    try {
        if (plannerData) {
            localStorage.setItem("plannerMasterData", JSON.stringify(plannerData));
            toast({
                title: "Success",
                description: "Planner master data saved successfully.",
            });
        }
    } catch (error) {
        console.error("Failed to save master data:", error);
        toast({
            title: "Error",
            description: "Could not save planner data.",
            variant: "destructive",
        });
    }
  }

  if (!plannerData) {
      return (
          <MainLayout>
              <div className="flex items-center justify-center h-full">Loading...</div>
          </MainLayout>
      )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Planner Master Data</h1>
          <p className="text-muted-foreground">Manage your yearly financial targets and balances.</p>
        </div>

        <Tabs defaultValue="FY25" className="w-full">
          <TabsList>
            {fiscalYears.map(year => <TabsTrigger key={year} value={year}>{year}</TabsTrigger>)}
          </TabsList>

          {fiscalYears.map(year => (
            <TabsContent key={year} value={year} className="space-y-6">
              <PlannerMasterDataForm 
                year={year} 
                yearData={plannerData[year]}
                onMasterDataChange={handleMasterDataChange}
                onSave={handleSaveChanges}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  )
}
