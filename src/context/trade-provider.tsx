
"use client";

import * as React from "react";
import type { Trade } from "@/lib/types";

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
      localStorage.setItem("trades", JSON.stringify(newTrades));
      setTradesState(newTrades);
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
    setTrades(updatedTrades);
  };
  
  const updateTrade = (trade: Trade) => {
    const updatedTrades = trades.map(t => t.ticket === trade.ticket ? trade : t);
    setTrades(updatedTrades);
  };

  const deleteTrade = (ticket: number) => {
     const updatedTrades = trades.filter(t => t.ticket !== ticket);
     setTrades(updatedTrades);
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
