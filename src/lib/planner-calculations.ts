

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
        
        if (i > 0) {
            const prevYear = fiscalYears[i - 1];
            newData[year].openingBalance = { ...newData[prevYear].closingBalance };
        }

        let currentBalances = { ...newData[year].openingBalance };

        for (const month of months) {
            const monthData = newData[year].monthly[month];
            
            accountTypes.forEach(accType => {
                const opening = currentBalances[accType] || 0;
                const profitPerc = monthData.profitPercentage[accType] || 0;
                const withdrawal = monthData.withdrawals[accType] || 0;

                const profit = opening * (profitPerc / 100);
                
                currentBalances[accType] = opening + profit - withdrawal;
            });
        }
        
        newData[year].closingBalance = { ...currentBalances };
    }
    return newData;
}
