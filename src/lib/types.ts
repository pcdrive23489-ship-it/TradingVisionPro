export type Session = "Asian" | "London" | "New York";

export type Trade = {
  ticket: number;
  opening_time_utc: string;
  closing_time_utc: string;
  type: "buy" | "sell";
  lots: number;
  original_position_size: number;
  symbol: string;
  opening_price: number;
  closing_price: number;
  stop_loss: number;
  take_profit: number;
  commission_usd: number;
  swap_usd: number;
  profit_usd: number;
  profit_inr?: number; // Optional INR profit
  equity_usd: number;
  margin_level: string; 
  close_reason: string;
  notes?: string;
  chartUrl?: string;
  mistakes?: string[];
  mistake_1?: string;
  pips?: number; 
  risk_reward_ratio?: number; 
  session?: Session; 
};


export type MarketData = {
  pair: string;
  price: number;
  change: number;
  sentiment: "buy" | "sell" | "neutral";
  sentimentScore: number;
  volatility: "high" | "medium" | "low";
};
