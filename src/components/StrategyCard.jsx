import React from "react";

export default function StrategyCard({ strategy, budget }) {
  return (
    <div className="strategy-card">
      <h3>{strategy.title}</h3>
      <span className={"risk-badge risk-" + strategy.risk}>{strategy.risk} risk</span>
      <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "#6b6b80" }}>
        Min: ${strategy.minBudget}
      </span>
      <p>{strategy.description}</p>
      <ul>
        {strategy.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ul>
      {budget >= strategy.minBudget && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(0,212,170,0.08)", borderRadius: 8 }}>
          <span style={{ fontSize: "0.8rem", color: "#00d4aa" }}>
            With your ${budget} budget, you can start this strategy today.
          </span>
        </div>
      )}
    </div>
  );
}
