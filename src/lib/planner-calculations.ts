
import { getDaysInMonth } from "date-fns";

// --- Data Types ---
const fiscalYears = ["FY25", "FY26", "FY27", "FY28", "FY29", "FY30"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const accountTypes = ["Forex Trading", "Online", "Indian Market"];

interface MonthlyData {
  withdrawals: Record<string, number>;
  profitPercentage: Record<string, number>;
}

export interface YearlyData {
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
        const numericYear = 2000 + parseInt(year.substring(2));
        
        // If it's not the first year, set the opening balance from the previous year's closing balance.
        if (i > 0) {
            const prevYear = fiscalYears[i - 1];
            newData[year].openingBalance = { ...newData[prevYear].closingBalance };
        }

        let runningBalances = { ...newData[year].openingBalance };
        
        // Iterate through each month to calculate the closing balance for the current year
        for (const [monthIndex, month] of months.entries()) {
            const monthData = newData[year].monthly[month];
            
            accountTypes.forEach(accType => {
                let lastDayClosing = runningBalances[accType] || 0;
                
                const dailyProfitPerc = monthData.profitPercentage[accType] || 0;
                const totalMonthlyWithdrawal = monthData.withdrawals[accType] || 0;
                
                const daysInMonth = getDaysInMonth(new Date(numericYear, monthIndex));
                const tradingDays = Array.from({ length: daysInMonth }, (_, dayIdx) => new Date(numericYear, monthIndex, dayIdx + 1))
                                          .filter(date => date.getDay() > 0 && date.getDay() < 6).length;

                const dailyWithdrawal = tradingDays > 0 ? totalMonthlyWithdrawal / tradingDays : 0;

                for (let d = 1; d <= daysInMonth; d++) {
                    const date = new Date(numericYear, monthIndex, d);
                    if (date.getDay() > 0 && date.getDay() < 6) { // Is it a weekday?
                        const opening = lastDayClosing;
                        const pnl = (opening * dailyProfitPerc) / 100;
                        const closing = opening + pnl - dailyWithdrawal;
                        lastDayClosing = closing;
                    }
                }
                
                // Update the running balance for the current account type for the next month
                runningBalances[accType] = lastDayClosing;
            });
        }
        
        // After all months, the running balance is the closing balance for the year.
        newData[year].closingBalance = { ...runningBalances };
    }
    return newData;
}
