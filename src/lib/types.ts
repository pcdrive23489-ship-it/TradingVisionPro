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
  equity_usd: number;
  margin_level: string; // Can be 'so' or a number
  close_reason: string;
  notes?: string;
  chartUrl?: string;
  mistakes?: string[];
  pips?: number; // Calculated field
  riskRewardRatio?: number; // Calculated field
  session?: Session; // Calculated field
};


export type MarketData = {
  pair: string;
  price: number;
  change: number;
  sentiment: "buy" | "sell" | "neutral";
  sentimentScore: number;
  volatility: "high" | "medium" | "low";
};
