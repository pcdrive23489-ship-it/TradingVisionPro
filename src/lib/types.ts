export type Session = "Asian" | "London" | "New York";

export type Trade = {
  id: string;
  pair: string;
  direction: "buy" | "sell";
  entryPrice: number;
  exitPrice: number;
  pips: number;
  profit: number;
  date: string;
  session: Session;
  mistakes: string[];
  riskRewardRatio: number;
  notes: string;
  chartUrl?: string;
  lotSize: number;
  stopLoss: number;
};

export type MarketData = {
  pair: string;
  price: number;
  change: number;
  sentiment: "buy" | "sell" | "neutral";
  sentimentScore: number;
  volatility: "high" | "medium" | "low";
};
