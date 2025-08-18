
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from 'next-themes';

function TradingViewMarketWidget() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (container.current) {
      // Clear the container before appending a new script
      container.current.innerHTML = "";
      
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "colorTheme": "${theme === 'dark' ? 'dark' : 'light'}",
          "dateRange": "12M",
          "showChart": true,
          "locale": "en",
          "width": "100%",
          "height": "100%",
          "largeChartUrl": "",
          "isTransparent": true,
          "showSymbolLogo": true,
          "showFloatingTooltip": false,
          "tabs": [
            {
              "title": "Forex",
              "symbols": [
                { "s": "FX:EURUSD" },
                { "s": "FX:GBPUSD" },
                { "s": "FX:USDJPY" },
                { "s": "FX:USDCHF" },
                { "s": "FX:AUDUSD" },
                { "s": "FX:USDCAD" }
              ],
              "originalTitle": "Forex"
            },
            {
              "title": "Indices",
              "symbols": [
                { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
                { "s": "FOREXCOM:NSXUSD", "d": "US 100" },
                { "s": "FOREXCOM:DJI", "d": "Dow 30" },
                { "s": "INDEX:NKY", "d": "Nikkei 225" },
                { "s": "INDEX:DEU40", "d": "DAX Index" },
                { "s": "FOREXCOM:UKXGBP", "d": "UK 100" }
              ],
              "originalTitle": "Indices"
            },
            {
              "title": "Commodities",
              "symbols": [
                { "s": "CME_MINI:GC1!", "d": "Gold" },
                { "s": "CME:CL1!", "d": "Crude Oil" },
                { "s": "NYMEX:NG1!", "d": "Natural Gas" },
                { "s": "TVC:SILVER", "d": "Silver" }
              ],
              "originalTitle": "Commodities"
            },
            {
              "title": "Crypto",
              "symbols": [
                { "s": "BITSTAMP:BTCUSD" },
                { "s": "BITSTAMP:ETHUSD" },
                { "s": "COINBASE:SOLUSD" },
                { "s": "COINBASE:XRPUSD" }
              ],
              "originalTitle": "Crypto"
            }
          ]
        }`;
      
      container.current.appendChild(script);
    }
  }, [theme]); // Re-run the effect when the theme changes

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "500px", width: "100%" }}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export const MemoizedTradingViewMarketWidget = memo(TradingViewMarketWidget);
export { TradingViewMarketWidget };
