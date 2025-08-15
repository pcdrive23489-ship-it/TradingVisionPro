'use server';

/**
 * @fileOverview An AI flow that analyzes past trading data and provides personalized, actionable insights to improve trading performance.
 *
 * - getTradingInsights - A function that analyzes trading data and returns personalized insights.
 * - TradingInsightsInput - The input type for the getTradingInsights function.
 * - TradingInsightsOutput - The return type for the getTradingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TradingDataSchema = z.object({
  trades: z.array(
    z.object({
      pair: z.string().describe('The currency pair traded (e.g., EUR/USD).'),
      direction: z
        .enum(['buy', 'sell'])
        .describe('The direction of the trade.'),
      entryPrice: z.number().describe('The entry price of the trade.'),
      exitPrice: z.number().describe('The exit price of the trade.'),
      pips: z.number().describe('The profit/loss in pips.'),
      session: z
        .string()
        .describe(
          'The trading session (e.g., Asian, London, New York). Must be one of these three values.'
        ),
      mistakes: z
        .array(z.string())
        .optional()
        .describe(
          'Any mistakes made during the trade (e.g., Overtrading, Late Entry).'
        ),
      riskRewardRatio: z
        .number()
        .optional()
        .describe('The risk reward ratio of the trade'),
    })
  ).describe('An array of past trading data.'),
});

const TradingInsightsInputSchema = z.object({
  tradingData: TradingDataSchema.describe('The past trading data to analyze.'),
});
export type TradingInsightsInput = z.infer<typeof TradingInsightsInputSchema>;

const TradingInsightsOutputSchema = z.object({
  insights: z.array(
    z.object({
      recommendation: z.string().describe('A specific, actionable recommendation.'),
      rationale: z.string().describe('The rationale behind the recommendation.'),
    })
  ).describe('A list of personalized trading insights.'),
});
export type TradingInsightsOutput = z.infer<typeof TradingInsightsOutputSchema>;

export async function getTradingInsights(input: TradingInsightsInput): Promise<TradingInsightsOutput> {
  return tradingInsightsFlow(input);
}

const tradingInsightsPrompt = ai.definePrompt({
  name: 'tradingInsightsPrompt',
  input: {schema: TradingInsightsInputSchema},
  output: {schema: TradingInsightsOutputSchema},
  prompt: `You are an expert trading analyst. Analyze the provided trading data and provide personalized, actionable insights to improve the user's trading performance.

Trading Data:
{{#each tradingData.trades}}
  - Pair: {{pair}}, Direction: {{direction}}, Entry: {{entryPrice}}, Exit: {{exitPrice}}, Pips: {{pips}}, Session: {{session}}{{#if mistakes}}, Mistakes: {{mistakes}}{{/if}}
{{/each}}

Provide insights that suggest specific sessions to avoid or instruments to focus on, to help the user make more informed decisions and increase their profitability. Each insight should have the fields recommendation and rationale.

Insights:`,
});

const tradingInsightsFlow = ai.defineFlow(
  {
    name: 'tradingInsightsFlow',
    inputSchema: TradingInsightsInputSchema,
    outputSchema: TradingInsightsOutputSchema,
  },
  async input => {
    const {output} = await tradingInsightsPrompt(input);
    return output!;
  }
);
