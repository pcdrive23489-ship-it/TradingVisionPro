'use server';

/**
 * @fileOverview An AI flow that provides financial planning insights for traders.
 *
 * - getFinancialPlannerInsights - A function that analyzes financial data and returns personalized suggestions.
 * - FinancialPlannerInput - The input type for the getFinancialPlannerInsights function.
 * - FinancialPlannerOutput - The return type for the getFinancialPlannerInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialPlannerInputSchema = z.object({
  openingBalances: z.record(z.number()).describe('The opening balances for each account type (e.g., {"Forex Trading": 50000}).'),
  incomeTarget: z.number().describe('The yearly income target.'),
  savingsTarget: z.number().describe('The yearly savings target.'),
  month: z.string().describe('The month for which to generate suggestions (e.g., "Jan", "Feb").'),
});
export type FinancialPlannerInput = z.infer<typeof FinancialPlannerInputSchema>;

const SuggestionSchema = z.object({
        amount: z.number().describe('The suggested numerical amount.'),
        rationale: z.string().describe('The reasoning behind the suggestion.'),
});

const FinancialPlannerOutputSchema = z.object({
  withdrawalSuggestions: z.record(SuggestionSchema).describe('Suggested withdrawal amounts for each account type.'),
  profitTargetSuggestions: z.record(SuggestionSchema).describe('Suggested monthly profit percentage targets for each account type.'),
});
export type FinancialPlannerOutput = z.infer<typeof FinancialPlannerOutputSchema>;


export async function getFinancialPlannerInsights(input: FinancialPlannerInput): Promise<FinancialPlannerOutput> {
  return financialPlannerFlow(input);
}

const financialPlannerPrompt = ai.definePrompt({
  name: 'financialPlannerPrompt',
  input: {schema: FinancialPlannerInputSchema},
  output: {schema: FinancialPlannerOutputSchema},
  prompt: `You are an expert financial advisor for traders. Your goal is to provide actionable, conservative, and realistic suggestions to help a user achieve their financial goals.

Analyze the provided financial data for the month of {{{month}}}.

**User's Financials:**
- Yearly Income Target: \${{{incomeTarget}}}
- Yearly Savings Target: \${{{savingsTarget}}}
- Opening Balances:
{{#each openingBalances}}
  - {{@key}}: \${{this}}
{{/each}}

**Your Task:**
Generate suggestions for monthly withdrawals and profit percentage targets for each account type.

**Guidelines:**
1.  **Withdrawals:** Suggest a sustainable withdrawal amount. It should be a small percentage of the anticipated monthly profit, ensuring the account can still grow. If the opening balance is low, suggest zero withdrawals.
2.  **Profit Targets:** Suggest a realistic monthly profit percentage. It should be challenging but achievable. A good starting point is between 5-15% of the opening balance, depending on the account type. Avoid suggesting excessively high percentages.
3.  **Rationale:** For each suggestion, provide a clear and concise rationale. Explain *why* you are making this recommendation.

Provide the output in the specified JSON format with suggestions for each account type.`,
});

const financialPlannerFlow = ai.defineFlow(
  {
    name: 'financialPlannerFlow',
    inputSchema: FinancialPlannerInputSchema,
    outputSchema: FinancialPlannerOutputSchema,
  },
  async input => {
    const {output} = await financialPlannerPrompt(input);
    return output!;
  }
);
