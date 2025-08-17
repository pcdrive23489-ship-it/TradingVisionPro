
"use client";

import * as React from "react";
import type { Trade } from "@/lib/types";
import { mockTrades } from "@/lib/data"; // Assuming you might want mock data again

interface TradesContextType {
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Omit<Trade, 'ticket'>) => void;
  updateTrade: (trade: Trade) => void;
  deleteTrade: (ticket: number) => void;
  deleteAllTrades: () => void;
  loading: boolean;
}

const TradesContext = React.createContext<TradesContextType | undefined>(undefined);

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const [trades, setTradesState] = React.useState<Trade[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    try {
      const savedTrades = localStorage.getItem("trades");
      if (savedTrades) {
        setTradesState(JSON.parse(savedTrades));
      } else {
        // Optional: initialize with mock data if no saved data found
        // setTradesState(mockTrades);
      }
    } catch (error) {
      console.error("Failed to load trades from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const setTrades = (newTrades: Trade[]) => {
     setLoading(true);
    try {
       const tradesWithCalculations = newTrades.map(trade => {
            const closingHour = new Date(trade.closing_time_utc).getUTCHours();
            if (closingHour >= 0 && closingHour < 9) trade.session = "Asian";
            else if (closingHour >= 9 && closingHour < 17) trade.session = "London";
            else trade.session = "New York";

            if (trade.stop_loss && trade.opening_price && trade.take_profit) {
                const risk = Math.abs(trade.opening_price - trade.stop_loss);
                const reward = Math.abs(trade.take_profit - trade.opening_price);
                if (risk > 0) trade.riskRewardRatio = reward / risk;
            }
            if(trade.closing_price && trade.opening_price && trade.symbol) {
              const pips = (trade.closing_price - trade.opening_price) / (trade.symbol.toUpperCase().includes('JPY') ? 0.01 : 0.0001);
              trade.pips = Math.round(pips);
            }
            return trade;
      });

      localStorage.setItem("trades", JSON.stringify(tradesWithCalculations));
      setTradesState(tradesWithCalculations);
    } catch (error) {
      console.error("Failed to save trades to localStorage", error);
    } finally {
        setLoading(false);
    }
  };

  const addTrade = (tradeData: Omit<Trade, 'ticket'>) => {
    const newTicket = new Date().getTime(); // Simple unique ID
    const newTrade = { ...tradeData, ticket: newTicket } as Trade;
    const updatedTrades = [...trades, newTrade];
    localStorage.setItem("trades", JSON.stringify(updatedTrades));
    setTradesState(updatedTrades);
  };
  
  const updateTrade = (trade: Trade) => {
    const updatedTrades = trades.map(t => t.ticket === trade.ticket ? trade : t);
    localStorage.setItem("trades", JSON.stringify(updatedTrades));
    setTradesState(updatedTrades);
  };

  const deleteTrade = async (ticket: number) => {
     const updatedTrades = trades.filter(t => t.ticket !== ticket);
     localStorage.setItem("trades", JSON.stringify(updatedTrades));
     setTradesState(updatedTrades);
  }

  const deleteAllTrades = () => {
    localStorage.removeItem("trades");
    setTradesState([]);
  }
  
  return (
    <TradesContext.Provider value={{ trades, setTrades, addTrade, updateTrade, deleteTrade, deleteAllTrades, loading }}>
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
