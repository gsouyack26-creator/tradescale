#!/usr/bin/env python3
"""Fetch live ARK Invest daily trades and write data/trades.json.
Runs on GitHub Actions (daily cron). No API key required.
Sources: arkfunds.io (unofficial API) + ark-funds.com official holdings CSV.
"""
import urllib.request, json, csv, io, os, sys
from datetime import datetime, timezone

UA = {"User-Agent": "Mozilla/5.0 (TradeScale data fetcher)"}

FUNDS = {
    "ARKK": {"trader": "Cathie Wood",  "fund": "ARK Innovation ETF (ARKK)",       "style": "Disruptive Innovation"},
    "ARKW": {"trader": "Cathie Wood",  "fund": "ARK Next Gen Internet (ARKW)",    "style": "Next-Gen Internet / Fintech"},
    "ARKG": {"trader": "Cathie Wood",  "fund": "ARK Genomic Revolution (ARKG)",   "style": "Genomics / Biotech"},
    "ARKF": {"trader": "Cathie Wood",  "fund": "ARK Fintech Innovation (ARKF)",   "style": "Fintech Innovation"},
    "ARKQ": {"trader": "Cathie Wood",  "fund": "ARK Autonomous Tech (ARKQ)",      "style": "Robotics / Autonomous Tech"},
    "ARKX": {"trader": "Cathie Wood",  "fund": "ARK Space Exploration (ARKX)",    "style": "Space / Aerospace"},
}

def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()

def quote(symbol):
    """Current market price for a symbol via Yahoo (no key). None on failure."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1d"
    try:
        d = json.loads(fetch(url))
        m = d["chart"]["result"][0]["meta"]
        return m.get("regularMarketPrice")
    except Exception:
        return None

def load_holdings(fund):
    """Return {ticker: {price, weight}} and total AUM from official CSV."""
    url = f"https://assets.ark-funds.com/fund-documents/funds-etf-csv/{FUND_CSV[fund]}"
    prices, aum = {}, 0.0
    try:
        text = fetch(url).decode("utf-8", "ignore")
        reader = csv.DictReader(io.StringIO(text))
        for row in reader:
            tk = (row.get("ticker") or "").strip()
            if not tk:
                continue
            try:
                shares = float((row.get("shares") or "0").replace(",", ""))
                mv = float((row.get("market value ($)") or row.get("market value($)") or "0").replace(",", "").replace("$", ""))
            except ValueError:
                continue
            if shares > 0 and mv > 0:
                prices[tk] = mv / shares
                aum += mv
    except Exception as e:
        print(f"  [warn] holdings CSV failed for {fund}: {e}", file=sys.stderr)
    return prices, aum

FUND_CSV = {
    "ARKK": "ARK_INNOVATION_ETF_ARKK_HOLDINGS.csv",
    "ARKW": "ARK_NEXT_GENERATION_INTERNET_ETF_ARKW_HOLDINGS.csv",
    "ARKG": "ARK_GENOMIC_REVOLUTION_ETF_ARKG_HOLDINGS.csv",
    "ARKF": "ARK_FINTECH_INNOVATION_ETF_ARKF_HOLDINGS.csv",
    "ARKQ": "ARK_AUTONOMOUS_TECH._&_ROBOTICS_ETF_ARKQ_HOLDINGS.csv",
    "ARKX": "ARK_SPACE_EXPLORATION_&_INNOVATION_ETF_ARKX_HOLDINGS.csv",
}

def main():
    all_trades, traders, tid_map = [], [], {}
    trade_id = 1
    trader_id = 1
    latest_date = ""

    for fund, meta in FUNDS.items():
        print(f"Fetching {fund}...")
        try:
            data = json.loads(fetch(f"https://arkfunds.io/api/v2/etf/trades?symbol={fund}"))
        except Exception as e:
            print(f"  [warn] trades API failed for {fund}: {e}", file=sys.stderr)
            continue

        prices, aum = load_holdings(fund)
        if aum <= 0:
            aum = 5_000_000_000  # conservative fallback

        # one trader entry per fund
        traders.append({
            "id": trader_id,
            "name": meta["trader"],
            "fund": meta["fund"],
            "port": round(aum),
            "style": meta["style"],
            "src": "ARK daily disclosure",
        })
        this_tid = trader_id
        trader_id += 1

        for t in data.get("trades", []):
            tk = t.get("ticker", "")
            shares = t.get("shares", 0) or 0
            etf_pct = t.get("etf_percent", 0) or 0
            price = prices.get(tk)
            if price is None and shares > 0 and etf_pct > 0:
                price = (etf_pct / 100.0) * aum / shares
            if price is None:
                price = 0
            value = shares * price
            date = t.get("date", "")
            if date > latest_date:
                latest_date = date
            action = "BUY" if str(t.get("direction", "")).lower().startswith("b") else "SELL"
            all_trades.append({
                "id": trade_id,
                "tid": this_tid,
                "ticker": tk,
                "co": t.get("company", tk),
                "action": action,
                "shares": int(shares),
                "price": round(price, 2),
                "value": round(value),
                "date": date,
                "port": round(aum),
                "why": f"{meta['style']} thesis. {action.title()} representing {etf_pct:.2f}% of {fund}.",
            })
            trade_id += 1

    # sort newest first, cap size
    all_trades.sort(key=lambda x: x["date"], reverse=True)
    all_trades = all_trades[:60]

    # current market prices for every traded ticker (for live quotes + paper-trade P&L)
    print("\nFetching current quotes...")
    prices = {}
    for t in all_trades:
        tk = t["ticker"]
        if tk and tk not in prices:
            q = quote(tk)
            if q is not None:
                prices[tk] = round(q, 2)
    print(f"  got {len(prices)} live quotes")

    out = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "prices": prices,
        "latest_trade_date": latest_date,
        "source": "ARK Invest daily disclosures (arkfunds.io + ark-funds.com)",
        "traders": traders,
        "trades": all_trades,
    }

    os.makedirs("data", exist_ok=True)
    with open("data/trades.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)

    print(f"\nWrote data/trades.json: {len(traders)} funds, {len(all_trades)} trades, latest {latest_date}")

if __name__ == "__main__":
    main()
