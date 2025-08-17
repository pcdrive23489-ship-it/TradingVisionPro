import type { MarketData, Session, Trade } from "./types";

export const mockMarketData: MarketData[] = [];

export const mockSessionData: Record<Session, { pnl: number }> = {
    "Asian": 0,
    "London": 0,
    "New York": 0,
};

export const mockTrades: Trade[] = [];

export const mistakeTags = ["Overtrading", "Late Entry", "FOMO", "Revenge Trading", "Ignoring SL", "Exiting Too Early"];
