
"use client"

import * as React from "react"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Save, Wand2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getFinancialPlannerInsights, FinancialPlannerOutput } from "@/ai/flows/financial-planner-insights"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


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
  incomeTarget: number;
  savingsTarget: number;
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
        profitPercentage: { "Forex Trading": 1, "Online": 1, "Indian Market": 1 }
      };
    }

    const openingBalance = { ...lastYearClosing };
    data[year] = {
      openingBalance,
      closingBalance: { "Forex Trading": 0, "Online": 0, "Indian Market": 0 },
      incomeTarget: 60000,
      savingsTarget: 25000,
      monthly,
    };
    // Placeholder for carry-over logic for next year's opening
    lastYearClosing = { "Forex Trading": 0, "Online": 0, "Indian Market": 0 };
  }
  return data;
};


function PlannerMasterDataForm({ year, yearData, onMasterDataChange, onSave }: { year: string, yearData: YearlyData, onMasterDataChange: (year: string, section: string, key: string, value: number, month?: string) => void, onSave: () => void }) {
    const [aiSuggestions, setAiSuggestions] = React.useState<FinancialPlannerOutput | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [selectedMonthForAI, setSelectedMonthForAI] = React.useState(months[0]);
    const { toast } = useToast();

    const handleBalanceChange = (field: string, value: string) => {
        onMasterDataChange(year, 'openingBalance', field, parseFloat(value) || 0);
    }
    
    const handleTargetChange = (field: 'incomeTarget' | 'savingsTarget', value: string) => {
        onMasterDataChange(year, field, '', parseFloat(value) || 0);
    }

    const handleProfitChange = (month: string, field: string, value: string) => {
        onMasterDataChange(year, 'profit', field, parseFloat(value) || 1, month);
    }
    
    const handleWithdrawalChange = (month: string, field: string, value: string) => {
        onMasterDataChange(year, 'withdrawal', field, parseFloat(value) || 0, month);
    }
    
    const handleGenerateAISuggestions = async () => {
      setIsGenerating(true);
      setAiSuggestions(null);
      try {
        const result = await getFinancialPlannerInsights({
          openingBalances: yearData.openingBalance,
          incomeTarget: yearData.incomeTarget,
          savingsTarget: yearData.savingsTarget,
          month: selectedMonthForAI,
        });
        setAiSuggestions(result);
      } catch (error) {
        console.error("AI suggestion error:", error);
        toast({ title: "Error", description: "Could not generate AI suggestions.", variant: "destructive" });
      } finally {
        setIsGenerating(false);
      }
    };
    
    const applyAISuggestions = (type: 'withdrawals' | 'profits') => {
      if (!aiSuggestions) return;

      const suggestions = type === 'withdrawals' ? aiSuggestions.withdrawalSuggestions : aiSuggestions.profitTargetSuggestions;
      const section = type === 'withdrawals' ? 'withdrawal' : 'profit';

      accountTypes.forEach(accType => {
        if(suggestions[accType]) {
          onMasterDataChange(year, section, accType, suggestions[accType].amount, selectedMonthForAI);
        }
      });

      toast({
        title: "AI Suggestions Applied",
        description: `Updated ${type} for ${selectedMonthForAI} based on AI recommendations.`
      });
    };

    const totalWithdrawals = React.useMemo(() => {
        const totals: Record<string, number> = { "Forex Trading": 0, "Online": 0, "Indian Market": 0 };
        months.forEach(month => {
            accountTypes.forEach(accType => {
                 totals[accType] += yearData.monthly[month].withdrawals[accType] || 0;
            });
        });
        return totals;
    }, [yearData]);

    const totalOpeningBalance = React.useMemo(() => {
       return Object.values(yearData.openingBalance).reduce((a, b) => a + b, 0);
    }, [yearData.openingBalance]);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    Planner Master Data - {year}
                    <Button size="sm" onClick={onSave}><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
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
                                {Object.keys(totalWithdrawals).map(key => <TableCell key={key}>${totalWithdrawals[key].toLocaleString()}</TableCell>)}
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
                                <TableRow className="font-bold bg-muted/50">
                                    <TableCell>Total Opening</TableCell>
                                    <TableCell>${totalOpeningBalance.toLocaleString()}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                     {/* Targets */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Yearly Targets</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Income Target</TableCell>
                                    <TableCell>
                                        <Input type="number" className="w-28" value={yearData.incomeTarget || 0} onChange={e => handleTargetChange('incomeTarget', e.target.value)} />
                                    </TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="font-medium">Savings Target</TableCell>
                                    <TableCell>
                                        <Input type="number" className="w-28" value={yearData.savingsTarget || 0} onChange={e => handleTargetChange('savingsTarget', e.target.value)} />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    
                    {/* AI Assistant */}
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wand2 className="text-primary" /> AI Assistant
                            </CardTitle>
                             <CardDescription>Get suggestions for withdrawals and profit targets for a specific month.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center gap-2">
                               <Select value={selectedMonthForAI} onValueChange={setSelectedMonthForAI}>
                                   <SelectTrigger>
                                       <SelectValue placeholder="Select month" />
                                   </SelectTrigger>
                                   <SelectContent>
                                       {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                   </SelectContent>
                               </Select>
                               <Button onClick={handleGenerateAISuggestions} disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Generate
                                </Button>
                           </div>
                            {isGenerating && <p className="text-sm text-muted-foreground text-center">Generating suggestions...</p>}
                            {aiSuggestions && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold">Withdrawal Suggestions</h4>
                                            <Button size="sm" variant="outline" onClick={() => applyAISuggestions('withdrawals')}>Apply</Button>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            {Object.entries(aiSuggestions.withdrawalSuggestions).map(([acc, sug]) => (
                                                <p key={acc}><strong>{acc}:</strong> ${sug.amount.toLocaleString()} - <i className="text-muted-foreground">{sug.rationale}</i></p>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                         <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold">Profit Target Suggestions</h4>
                                            <Button size="sm" variant="outline" onClick={() => applyAISuggestions('profits')}>Apply</Button>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            {Object.entries(aiSuggestions.profitTargetSuggestions).map(([acc, sug]) => (
                                                <p key={acc}><strong>{acc}:</strong> {sug.amount}% - <i className="text-muted-foreground">{sug.rationale}</i></p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                     </Card>

                </div>

                {/* Profit % Table */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Target Monthly Profit %</h3>
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
                                                value={yearData.monthly[month].profitPercentage[accType] || 1}
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
  const [activeYear, setActiveYear] = React.useState(fiscalYears[0]);
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
        const newData = JSON.parse(JSON.stringify(prev));
        
        if (section === 'openingBalance') {
            newData[year].openingBalance[key] = value;
        } else if (section === 'incomeTarget' || section === 'savingsTarget') {
            newData[year][section] = value;
        } else if (month) {
            if (section === 'profit') {
                 newData[year].monthly[month].profitPercentage[key] = value || 1;
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

        <Tabs defaultValue={activeYear} onValueChange={setActiveYear} className="w-full">
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

    