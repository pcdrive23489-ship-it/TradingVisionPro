
"use client";

import * as React from "react";
import { collection, doc, getDocs, writeBatch, setDoc, deleteDoc } from "firebase/firestore";
import type { Trade } from "@/lib/types";
import { db } from "@/lib/firebase";
import { useAuth } from "./auth-provider";

interface TradesContextType {
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Omit<Trade, 'ticket'>) => Promise<void>;
  updateTrade: (trade: Trade) => Promise<void>;
  deleteTrade: (ticket: number) => Promise<void>;
  deleteAllTrades: () => Promise<void>;
  loading: boolean;
}

const TradesContext = React.createContext<TradesContextType | undefined>(undefined);

export function TradesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [trades, setTradesState] = React.useState<Trade[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTrades = async () => {
      if (!user) {
        setTradesState([]);
        setLoading(false);
        return;
      };
      setLoading(true);
      try {
        const tradesCollection = collection(db, "users", user.uid, "trades");
        const snapshot = await getDocs(tradesCollection);
        const userTrades = snapshot.docs.map(doc => doc.data() as Trade);
        setTradesState(userTrades);
      } catch (error) {
        console.error("Failed to load trades from Firestore", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

  const setTrades = async (newTrades: Trade[]) => {
     if (!user) return;
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

      const tradesCollection = collection(db, "users", user.uid, "trades");
      const batch = writeBatch(db);
      
      // Delete existing trades
      const snapshot = await getDocs(tradesCollection);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Add new trades
      tradesWithCalculations.forEach(trade => {
        const docRef = doc(tradesCollection, String(trade.ticket));
        batch.set(docRef, trade);
      });
      
      await batch.commit();
      setTradesState(tradesWithCalculations);
    } catch (error) {
      console.error("Failed to save trades to Firestore", error);
    } finally {
        setLoading(false);
    }
  };

  const addTrade = async (tradeData: Omit<Trade, 'ticket'>) => {
    if (!user) return;
    const newTicket = new Date().getTime(); // Simple unique ID
    const newTrade = { ...tradeData, ticket: newTicket } as Trade;
    const docRef = doc(db, "users", user.uid, "trades", String(newTrade.ticket));
    await setDoc(docRef, newTrade);
    setTradesState(prev => [...prev, newTrade]);
  };
  
  const updateTrade = async (trade: Trade) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "trades", String(trade.ticket));
    await setDoc(docRef, trade, { merge: true });
    setTradesState(prev => prev.map(t => t.ticket === trade.ticket ? trade : t));
  };

  const deleteTrade = async (ticket: number) => {
     if (!user) return;
     const docRef = doc(db, "users", user.uid, "trades", String(ticket));
     await deleteDoc(docRef);
     setTradesState(prev => prev.filter(t => t.ticket !== ticket));
  }

  const deleteAllTrades = async () => {
    if (!user) return;
    const tradesCollection = collection(db, "users", user.uid, "trades");
    const snapshot = await getDocs(tradesCollection);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
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
