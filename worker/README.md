# TradeScale Quote Proxy (Cloudflare Worker)

**Deployed URL:** https://tradescale-quotes.gsouyack26.workers.dev  (wired into tradescale.html as QUOTE_PROXY)

Hides the Finnhub API key server-side and serves live stock quotes to the app.
Locks CORS to the app origin and edge-caches each symbol for 20s so many visitors
cost only a few upstream Finnhub calls (protects the free tier).

## Deploy (one time)

From this `worker/` directory:

```bash
npx wrangler login                 # opens browser, click Allow (free Cloudflare account)
npx wrangler secret put FINNHUB_KEY  # paste your Finnhub key when prompted
npx wrangler deploy                # prints your Worker URL
```

Deploy prints something like:
`https://tradescale-quotes.<your-subdomain>.workers.dev`

## Wire the app

Set `QUOTE_PROXY` in `tradescale.html` to that URL. The app then fetches
`QUOTE_PROXY + "?symbol=NVDA"` (no token) and the baked-in key can be removed.

## Update the key later

```bash
npx wrangler secret put FINNHUB_KEY   # paste the new key
```

No app redeploy needed — the Worker picks it up immediately.
