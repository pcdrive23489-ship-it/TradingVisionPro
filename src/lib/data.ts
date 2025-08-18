
import type { MarketData, Session, Trade } from "./types";

const initialPairs: { pair: string; price: number; volatility: number }[] = [
    { pair: "EUR/USD", price: 1.0855, volatility: 0.5 },
    { pair: "GBP/USD", price: 1.2730, volatility: 0.7 },
    { pair: "USD/JPY", price: 157.25, volatility: 0.9 },
    { pair: "AUD/USD", price: 0.6650, volatility: 0.6 },
    { pair: "USD/CAD", price: 1.3680, volatility: 0.5 },
    { pair: "USD/CHF", price: 0.9145, volatility: 0.4 },
    { pair: "NZD/USD", price: 0.6170, volatility: 0.6 },
    { pair: "EUR/JPY", price: 170.65, volatility: 0.8 },
    { pair: "GBP/JPY", price: 200.15, volatility: 1.2 },
    { pair: "XAU/USD", price: 2330.50, volatility: 1.5 },
    { pair: "BTC/USD", price: 68500.00, volatility: 2.5 },
    { pair: "ETH/USD", price: 3800.00, volatility: 3.0 },
];


export const mockMarketData: MarketData[] = initialPairs.map(p => ({
    pair: p.pair,
    price: p.price,
    initialPrice: p.price,
    change: 0.0,
    sentimentScore: 50 + (Math.random() - 0.5) * 40,
    volatilityScore: p.volatility,
}));

export const mockSessionData: Record<Session, { pnl: number }> = {
    "Asian": 0,
    "London": 0,
    "New York": 0,
};

export const mockTrades: Trade[] = [];

export const mistakeTags = ["Overtrading", "Late Entry", "FOMO", "Revenge Trading", "Ignoring SL", "Exiting Too Early"];
