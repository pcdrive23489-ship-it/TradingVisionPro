
import type { Session, Trade } from "./types";
import type { MarketData } from "./types";

export const mockSessionData: Record<Session, { pnl: number }> = {
    "Asian": 0,
    "London": 0,
    "New York": 0,
};

export const mockTrades: Trade[] = [];

export const mistakeTags = ["Overtrading", "Late Entry", "FOMO", "Revenge Trading", "Ignoring SL", "Exiting Too Early"];

export const mockMarketData: MarketData[] = [
  { pair: "EUR/USD", price: 1.0850, initialPrice: 1.0850, change: 0, sentimentScore: 65, volatilityScore: 15 },
  { pair: "GBP/USD", price: 1.2650, initialPrice: 1.2650, change: 0, sentimentScore: 58, volatilityScore: 18 },
  { pair: "USD/JPY", price: 149.50, initialPrice: 149.50, change: 0, sentimentScore: 72, volatilityScore: 12 },
  { pair: "AUD/USD", price: 0.6580, initialPrice: 0.6580, change: 0, sentimentScore: 45, volatilityScore: 20 },
  { pair: "USD/CAD", price: 1.3750, initialPrice: 1.3750, change: 0, sentimentScore: 55, volatilityScore: 14 },
  { pair: "EUR/GBP", price: 0.8580, initialPrice: 0.8580, change: 0, sentimentScore: 62, volatilityScore: 16 },
  { pair: "USD/CHF", price: 0.8950, initialPrice: 0.8950, change: 0, sentimentScore: 68, volatilityScore: 11 },
  { pair: "NZD/USD", price: 0.5980, initialPrice: 0.5980, change: 0, sentimentScore: 42, volatilityScore: 22 },
];
