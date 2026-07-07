import React, { useState } from "react";
import { topTraders, recentTrades, smallStackStrategies } from "./data/trades";
import { scaleTrade, generateStrategy, formatMoney } from "./utils/scaling";
import TradeCard from "./components/TradeCard";
import StrategyCard from "./components/StrategyCard";
import DataSources from "./components/DataSources";

export default function App() {
  const [budget, setBudget] = useState(500);
  const [activeTab, setActiveTab] = useState("trades");

  const tabs = [
    { id: "trades", label: "Live Trades" },
    { id: "strategies", label: "Small Stack Plays" },
    { id: "sources", label: "Data Sources" },
  ];

  const enrichedTrades = recentTrades.map((trade) => {
    const trader = topTraders.find((t) => t.id === trade.traderId);
    const scaled = scaleTrade(trade, budget);
    const strategies = generateStrategy(trade, budget);
    return { ...trade, trader, scaled, strategies };
  });

  return (
    <div className="app">
      <header className="header">
        <h1>TradeScale</h1>
        <div className="budget-input">
          <label>My Budget:</label>
          <span style={{ color: "#ffd700", fontSize: "1.1rem" }}>$</span>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value) || 0)}
            min="0"
            step="50"
          />
        </div>
      </header>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={"tab" + (activeTab === tab.id ? " active" : "")}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "trades" && (
        <div>
          <p style={{ color: "#a0a0b0", marginBottom: 16, fontSize: "0.85rem" }}>
            Recent trades from top fund managers, congress members, and notable investors.
            Each trade is scaled to your {formatMoney(budget)} budget.
          </p>
          {enrichedTrades.map((trade) => (
            <TradeCard key={trade.id} trade={trade} budget={budget} />
          ))}
        </div>
      )}

      {activeTab === "strategies" && (
        <div>
          <p style={{ color: "#a0a0b0", marginBottom: 16, fontSize: "0.85rem" }}>
            Battle-tested strategies for accounts under $5K. Real ways to grow small money using the same
            principles as billion-dollar funds.
          </p>
          {smallStackStrategies
            .filter((s) => budget >= s.minBudget)
            .map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} budget={budget} />
            ))}
        </div>
      )}

      {activeTab === "sources" && <DataSources />}
    </div>
  );
}
