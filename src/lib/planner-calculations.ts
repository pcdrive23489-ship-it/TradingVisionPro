// --- Data Types ---
const fiscalYears = ["FY25", "FY26", "FY27", "FY28", "FY29", "FY30"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const accountTypes = ["Forex Trading", "Online", "Indian Market"];

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

export interface PlannerMasterDataState {
  [key: string]: YearlyData;
}


// --- Calculation Logic ---
export const calculatePlannerData = (data: PlannerMasterDataState): PlannerMasterDataState => {
    const newData = JSON.parse(JSON.stringify(data)); // Deep copy to avoid mutation
    
    for (let i = 0; i < fiscalYears.length; i++) {
        const year = fiscalYears[i];
        
        // If it's not the first year, set the opening balance from the previous year's closing balance.
        if (i > 0) {
            const prevYear = fiscalYears[i - 1];
            newData[year].openingBalance = { ...newData[prevYear].closingBalance };
        }

        let runningBalances = { ...newData[year].openingBalance };
        let yearlyTotalWithdrawals = 0;

        // Iterate through each month to calculate the closing balance for the current year
        for (const month of months) {
            const monthData = newData[year].monthly[month];
            
            accountTypes.forEach(accType => {
                const openingForMonth = runningBalances[accType] || 0;
                const profitPerc = monthData.profitPercentage[accType] || 0;
                const withdrawal = monthData.withdrawals[accType] || 0;
                const profit = openingForMonth * (profitPerc / 100);
                
                // Update the running balance for the current account type
                runningBalances[accType] = openingForMonth + profit - withdrawal;
                yearlyTotalWithdrawals += withdrawal;
            });
        }
        
        // After all months, the running balance is the closing balance for the year.
        newData[year].closingBalance = { ...runningBalances };
    }
    return newData;
}
