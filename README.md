# TradeScale 📈💰

**Track what top traders are buying — scaled to YOUR budget.**

A Progressive Web App (PWA) that monitors trades from the world's top fund managers, congressional members, and notable investors, then shows you exactly what their moves look like at your investment level.

## Features

### 🐋 Whale Trade Tracker
- Warren Buffett (Berkshire Hathaway) — 13F filings
- Bill Ackman (Pershing Square) — activist positions  
- Nancy Pelosi (Congressional trading) — disclosure reports
- Michael Burry (Scion) — contrarian plays
- Cathie Wood (ARK Invest) — daily trade disclosures
- Steve Cohen (Point72) — quant strategies

### 📊 Smart Scaling
Enter your budget ($100, $500, $5000 — whatever you have) and see:
- What % of their portfolio each trade represents
- How many shares YOU would buy at the same conviction level
- Fractional share calculations
- Conviction rating (how big a bet it is for them)

### 💡 Small Stack Strategies
Actionable plays for limited capital:
- **Coffee Can Portfolio** — set-and-forget quality stocks
- **Whale Watching** — mirror 13F high-conviction picks
- **The Wheel** — options income on small accounts
- **0DTE Scalping** — day trading with tiny capital
- **Dividend Snowball** — build passive income brick by brick

### 📱 Works Everywhere
- Install as app on iPhone/Android (Add to Home Screen)
- Desktop browser
- Offline capable (PWA)

## Data Sources (All Free & Legal)
| Source | What It Shows | Delay |
|--------|--------------|-------|
| SEC EDGAR 13F | Hedge fund holdings | 45 days |
| Congressional STOCK Act | Congress trades | 45 days |
| SEC Form 4 | Insider buying/selling | 2 days |
| ARK Invest | Cathie Wood daily trades | Same day |
| Options Flow | Unusual whale bets | Real-time |

## Getting Started

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/tradescale.git
cd tradescale

# Install
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

## Deploy to GitHub Pages (Free)

1. Push to GitHub
2. Go to Settings → Pages → Source: GitHub Actions
3. The included workflow auto-deploys on every push to `main`

## Tech Stack
- React 18 + Vite 5
- Recharts (for future chart features)
- Vite PWA Plugin (offline support)
- GitHub Pages (free hosting)

## Roadmap
- [ ] Live SEC EDGAR API integration
- [ ] Push notifications for tracked trader moves
- [ ] Performance backtesting (did whale trades profit?)
- [ ] Options flow scanner
- [ ] AI-powered trade thesis summaries
- [ ] Portfolio builder tool
- [ ] Social features (share your scaled portfolio)

## Disclaimer
⚠️ This is for educational purposes only. Not financial advice. Past performance of tracked traders does not guarantee future results. Always do your own research. Never invest money you can't afford to lose.

## License
MIT
