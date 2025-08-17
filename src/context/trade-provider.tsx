"use client";

import * as React from "react";
import type { Trade } from "@/lib/types";

interface TradesContextType {
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
}

const TradesContext = React.createContext<TradesContextType | undefined>(undefined);

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTradesState] = React.useState<Trade[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const savedTrades = localStorage.getItem("tradeData");
      if (savedTrades) {
        setTradesState(JSON.parse(savedTrades));
      }
    } catch (error) {
      console.error("Failed to load trades from localStorage", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const setTrades = (newTrades: Trade[]) => {
    try {
      const tradesWithSessions = newTrades.map(trade => {
        if (!trade.session) {
            const closingHour = new Date(trade.closing_time_utc).getUTCHours();
            // Basic session logic (can be refined)
            if (closingHour >= 1 && closingHour < 9) trade.session = "Asian";
            else if (closingHour >= 9 && closingHour < 17) trade.session = "London";
            else trade.session = "New York";
        }
        if (trade.stop_loss && trade.opening_price && trade.take_profit) {
            const risk = Math.abs(trade.opening_price - trade.stop_loss);
            const reward = Math.abs(trade.take_profit - trade.opening_price);
            if (risk > 0) {
              trade.riskRewardRatio = reward / risk;
            }
        }
        if(trade.closing_price && trade.opening_price && trade.symbol) {
          const pips = (trade.closing_price - trade.opening_price) / (trade.symbol.toUpperCase().includes('JPY') ? 0.01 : 0.0001);
          trade.pips = Math.round(pips);
        }

        return trade;
      })


      localStorage.setItem("tradeData", JSON.stringify(tradesWithSessions));
      setTradesState(tradesWithSessions);
    } catch (error) {
      console.error("Failed to save trades to localStorage", error);
    }
  };
  
  if (!isLoaded) {
      return null; // Or a loading spinner
  }

  return (
    <TradesContext.Provider value={{ trades, setTrades }}>
      {children}
    </TradesContext.Provider>
  );
}

export function useTrades() {
  const context = React.useContext(TradesContext);
  if (context === undefined) {
    throw new Error("useTrades must be used within a TradesProvider");
  }
  return context;
}
