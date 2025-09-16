
"use client";

import * as React from "react";
import type { Trade } from "@/lib/types";

interface TradesContextType {
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (trade: Trade) => void;
  deleteTrade: (ticket: number) => void;
  deleteAllTrades: () => Promise<void>;
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
      const sortedTrades = newTrades.sort((a,b) => new Date(a.closing_time_utc).getTime() - new Date(b.closing_time_utc).getTime());
      localStorage.setItem("trades", JSON.stringify(sortedTrades));
      setTradesState(sortedTrades);
    } catch (error) {
      console.error("Failed to save trades to localStorage", error);
    } finally {
        setLoading(false);
    }
  };

  const addTrade = (tradeData: Trade) => {
    const updatedTrades = [...trades, tradeData];
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

  const deleteAllTrades = async () => {
    setLoading(true);
    try {
        localStorage.removeItem("trades");
        setTradesState([]);
    } catch (error) {
        console.error("Failed to delete trades from localStorage", error);
        throw error;
    } finally {
        setLoading(false);
    }
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
