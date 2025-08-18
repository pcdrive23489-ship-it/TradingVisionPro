# TradeVision: Your AI-Powered Trading Journal

Welcome to TradeVision, a comprehensive, data-driven trading journal designed to help you analyze your performance, identify patterns, and achieve your financial goals. Built with Next.js, ShadCN UI, and powered by Google's Generative AI, TradeVision offers a suite of tools to elevate your trading strategy.

## Core Features

### 1. Interactive Dashboard
The main dashboard provides an at-a-glance summary of your trading performance.
- **Quick Stats Carousel**: Key metrics at your fingertips, including Win Rate, Total Trades, Average Risk/Reward Ratio, and your most profitable trading pair.
- **Profit/Loss Chart**: A dynamic area chart visualizing your cumulative profit and loss over various timeframes (Day, Week, Month, Year, All-Time).
- **Session Performance**: A bar chart that breaks down your profitability by trading session (Asian, London, New York), helping you identify when you trade best.
- **Recent Trades**: A quick-view table of your last five trades.

### 2. Comprehensive Trade Journal
Log and review every trade in meticulous detail.
- **Accordion View**: Keeps your journal clean, with each trade expandable to reveal more information.
- **Detailed Trade Data**: Track entry/exit prices, stop loss, take profit, lot size, commissions, notes, and associated mistakes.
- **Chart Snapshots**: Upload a screenshot of your chart setup for each trade to review your technical analysis later.
- **Search & Filter**: Easily find specific trades by searching for their symbol.
- **Edit & Delete**: Full control to update or remove trade entries.

### 3. In-Depth Performance Analysis
Go beyond P/L with powerful analytical tools.
- **AI-Suggested Insights**: A dedicated tab where you can generate personalized, actionable recommendations using Generative AI. The AI analyzes your trading data to find patterns and suggest improvements.
- **Mistake Analysis**: A pie chart that visualizes the frequency of your logged trading mistakes (e.g., FOMO, Revenge Trading), helping you pinpoint and correct bad habits.
- **Risk Management Insights**: Track your average Risk/Reward ratio and Profit Ratio against set targets with clear progress bars.
- **Instrument Profitability**: A bar chart that shows which trading pairs are your biggest winners and losers.

### 4. Session & Time-Based Analysis
Understand *when* you perform best.
- **Session Breakdown**: A dedicated page to analyze your performance across the Asian, London, and New York trading sessions.
- **Weekly Profitability Heatmap**: A powerful heatmap that shows your most (and least) profitable days and hours of the week, helping you optimize your trading schedule.

### 5. Trading Records
Celebrate your wins and learn from your losses.
- **All-Time Records**: Automatically tracks and displays your single highest win, highest loss, best P/L day, worst P/L day, best week, and worst week.

### 6. Financial Income Planner
Set goals and project your financial future.
- **Yearly Planning**: Set annual income and savings targets across multiple fiscal years (FY25-FY30).
- **Account-Based Planning**: Manage targets and projections for different trading accounts ("Forex Trading", "Online", "Indian Market").
- **Dynamic Projections**: The planner automatically calculates your projected daily, monthly, and yearly balances based on your input targets for profit percentage and withdrawals.
- **AI Assistant for Planning**: Get AI-driven suggestions for monthly withdrawal amounts and profit targets to ensure your goals are sustainable and realistic.
- **Rich Visualizations**:
  - **Balance Growth Chart**: An area chart showing the projected, compounded growth of your account balances over the year.
  - **P/L vs. Withdrawals Chart**: A bar chart comparing your projected monthly net profit against your planned withdrawals.

### 7. Full Data Control
Your data is yours. Manage it with ease.
- **CSV Import/Export**: Export your entire trade history to a CSV file for backup or external analysis. Import trades from a CSV file to bulk-add your history. You can choose to append to or replace existing data.
- **Local Storage**: All your trade and planner data is securely saved in your browser's local storage, ensuring privacy and quick access.
- **Delete All Data**: A secure option to wipe all trading data from the application.

## Technical Stack
- **Framework**: Next.js (App Router)
- **UI**: React, TypeScript, ShadCN UI, Tailwind CSS
- **AI Functionality**: Google AI & Genkit
- **Charts**: Recharts
- **Theming**: Light and Dark modes with `next-themes`.

This README provides a complete overview of the TradeVision application. Enjoy analyzing your trades!