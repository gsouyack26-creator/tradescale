import React from "react";
import { dataSources } from "../data/trades";

export default function DataSources() {
  return (
    <div>
      <p style={{ color: "#a0a0b0", marginBottom: 16, fontSize: "0.85rem" }}>
        Free and public data sources this app pulls from. All trader data comes from legally required
        public disclosures — no insider info, no paid services needed.
      </p>

      {Object.values(dataSources).map((source, i) => (
        <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700 }}>{source.name}</div>
            <div style={{ color: "#a0a0b0", fontSize: "0.85rem" }}>{source.description}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              padding: "2px 8px", borderRadius: 12, fontSize: "0.7rem", fontWeight: 600,
              background: source.free ? "rgba(0,212,170,0.15)" : "rgba(255,71,87,0.15)",
              color: source.free ? "#00d4aa" : "#ff4757",
            }}>
              {source.free ? "FREE" : "PAID"}
            </span>
            <a href={source.url} target="_blank" rel="noopener noreferrer"
              style={{ color: "#4a90d9", fontSize: "0.8rem" }}>
              Visit →
            </a>
          </div>
        </div>
      ))}

      <div className="card" style={{ marginTop: 24, borderColor: "#ffd700" }}>
        <h3 style={{ color: "#ffd700", marginBottom: 8 }}>How This App Gets Data</h3>
        <ul style={{ paddingLeft: 20, color: "#a0a0b0", fontSize: "0.85rem" }}>
          <li><strong>SEC 13F Filings</strong> — Every fund managing $100M+ must disclose holdings quarterly. 45-day delay.</li>
          <li><strong>Congressional STOCK Act</strong> — Members of Congress must disclose trades within 45 days.</li>
          <li><strong>SEC Form 4</strong> — Corporate insiders must report trades within 2 business days.</li>
          <li><strong>ARK Invest</strong> — Voluntarily publishes all trades daily via email/website.</li>
          <li><strong>Options Flow</strong> — Large unusual options bets are visible on public exchanges in real-time.</li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ color: "#4a90d9", marginBottom: 8 }}>Upcoming Features</h3>
        <ul style={{ paddingLeft: 20, color: "#a0a0b0", fontSize: "0.85rem" }}>
          <li>Live SEC EDGAR API integration (auto-fetch new 13F filings)</li>
          <li>Push notifications when tracked traders make moves</li>
          <li>Performance tracking — did following the whale work?</li>
          <li>Options flow scanner (unusual volume alerts)</li>
          <li>Portfolio builder — construct a mini whale portfolio</li>
        </ul>
      </div>
    </div>
  );
}
