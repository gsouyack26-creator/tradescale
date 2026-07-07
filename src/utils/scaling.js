export function scaleTrade(trade, userBudget) {
  const traderPortfolio = trade.portfolioSize || 1000000000;
  const tradeAmount = trade.value;
  const percentOfPortfolio = (tradeAmount / traderPortfolio) * 100;
  const yourAmount = (percentOfPortfolio / 100) * userBudget;
  const sharePrice = trade.price || tradeAmount / (trade.shares || 1);
  const yourShares = Math.floor(yourAmount / sharePrice);
  const fractionalShares = (yourAmount / sharePrice).toFixed(4);

  return {
    percentOfPortfolio: percentOfPortfolio.toFixed(2),
    yourAmount: yourAmount.toFixed(2),
    yourShares,
    fractionalShares,
    sharePrice: sharePrice.toFixed(2),
    conviction: percentOfPortfolio > 5 ? "HIGH" : percentOfPortfolio > 2 ? "MEDIUM" : "LOW",
  };
}

export function generateStrategy(trade, userBudget) {
  const strategies = [];
  const sharePrice = trade.price || 100;

  if (userBudget < sharePrice) {
    strategies.push({
      type: "Fractional Shares",
      description: "Buy $" + Math.min(userBudget * 0.05, 50).toFixed(0) + " worth via fractional shares on Fidelity/Robinhood",
      risk: "low",
    });
  }

  if (userBudget >= 100) {
    strategies.push({
      type: "ETF Exposure",
      description: "If " + trade.ticker + " is in SPY/QQQ, buying the ETF gives diversified exposure to same thesis",
      risk: "low",
    });
  }

  if (userBudget >= 500 && trade.action === "BUY") {
    strategies.push({
      type: "Poor Man Covered Call (PMCC)",
      description: "Buy deep ITM LEAPS call (70+ delta, 1yr out) for ~20% stock cost. Sell weekly calls against it.",
      risk: "medium",
    });
  }

  if (userBudget >= 200 && trade.action === "BUY") {
    strategies.push({
      type: "Bull Call Spread",
      description: "Buy ATM call, sell OTM call same expiry. Caps upside but cuts cost 50-70%.",
      risk: "medium",
    });
  }

  strategies.push({
    type: "Dollar-Cost Average",
    description: "Split into 4 weekly buys of $" + (Math.min(userBudget * 0.05, 25)).toFixed(0) + " to reduce timing risk",
    risk: "low",
  });

  return strategies;
}

export function formatMoney(num) {
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(1) + "K";
  return "$" + Number(num).toFixed(2);
}
