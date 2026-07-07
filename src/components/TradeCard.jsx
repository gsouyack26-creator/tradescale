import React, { useState } from "react";
import { formatMoney } from "../utils/scaling";

export default function TradeCard({ trade, budget }) {
  const [showStrategies, setShowStrategies] = useState(false);
  const { trader, scaled, strategies } = trade;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="trader-name">{trader?.name || "Unknown"}</div>
          <div className="trader-meta">
            {trader?.fund} &bull; {trader?.style} &bull; {trade.date}
          </div>
        </div>
        <span className={"trade-action " + trade.action.toLowerCase()}>
          {trade.action}
        </span>
      </div>

      <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 4 }}>
        {trade.ticker} <span style={{ color: "#a0a0b0", fontWeight: 400, fontSize: "0.85rem" }}>
          {trade.company}
        </span>
      </div>

      <div className="trade-details">
        <div className="detail-item">
          <div className="detail-label">Their Trade</div>
          <div className="detail-value">{formatMoney(trade.value)}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Share Price</div>
          <div className="detail-value">${trade.price}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">% of Portfolio</div>
          <div className="detail-value blue">{scaled.percentOfPortfolio}%</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Conviction</div>
          <div className={"detail-value " + (scaled.conviction === "HIGH" ? "green" : scaled.conviction === "MEDIUM" ? "gold" : "")}> 
            {scaled.conviction}
          </div>
        </div>
      </div>

      <div style={{ color: "#a0a0b0", fontSize: "0.85rem", fontStyle: "italic", marginBottom: 12 }}>
        {trade.rationale}
      </div>

      <div className="scaled-section">
        <h4>Scaled to Your ${budget} Budget:</h4>
        <div className="scaled-grid">
          <div className="scaled-item">
            <span>Your Position Size</span>
            <strong style={{ color: "#00d4aa" }}>${scaled.yourAmount}</strong>
          </div>
          <div className="scaled-item">
            <span>Whole Shares</span>
            <strong>{scaled.yourShares}</strong>
          </div>
          <div className="scaled-item">
            <span>Fractional</span>
            <strong>{scaled.fractionalShares} shares</strong>
          </div>
          <div className="scaled-item">
            <span>Same % Allocation</span>
            <strong style={{ color: "#4a90d9" }}>{scaled.percentOfPortfolio}%</strong>
          </div>
        </div>
      </div>

      {strategies.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setShowStrategies(!showStrategies)}
            style={{
              background: "transparent", border: "1px solid #2a2a4a",
              color: "#ffd700", padding: "6px 14px", borderRadius: 6,
              cursor: "pointer", fontSize: "0.8rem",
            }}
          >
            {showStrategies ? "Hide" : "Show"} Small-Budget Strategies ({strategies.length})
          </button>
          {showStrategies && (
            <div style={{ marginTop: 12 }}>
              {strategies.map((s, i) => (
                <div key={i} style={{ padding: "8px 12px", background: "#1a1a2e", borderRadius: 6, marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.85rem" }}>{s.type}</strong>
                    <span className={"risk-badge risk-" + s.risk}>{s.risk} risk</span>
                  </div>
                  <p style={{ color: "#a0a0b0", fontSize: "0.8rem", marginTop: 4 }}>{s.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: "0.7rem", color: "#6b6b80" }}>
        Source: {trader?.source}
      </div>
    </div>
  );
}
