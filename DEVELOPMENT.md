# TradeScale — Development & Architecture

> Single-file, offline-first PWA that surfaces public "smart-money" trade disclosures
> (fund managers, congress members, crypto whales) and **scales each trade to your budget**.
> A thinkorswim-style retail terminal built in one hand-rolled HTML file.

- **Repo:** `gsouyack26-creator/tradescale` · **Live:** https://gsouyack26-creator.github.io/tradescale/
- **File:** `tradescale.html` (~166 KB, ~2150 lines) — HTML + CSS + vanilla JS, **no framework, no CDN, no build step**
- **Deploy:** push to `main` → GitHub Pages
- **Local preview:** `python3 -m http.server 5911` in repo root

---

## 1. Hard constraints (never violate)

| Rule | Why |
|---|---|
| **One HTML file** | Zero-install, works from `file://`, trivially hostable |
| **Vanilla JS only** | No React/Vue/jQuery; no npm; no bundler |
| **No CDN / no external `<script>`** | Fully offline-capable PWA |
| **Hand-rolled SVG** for all charts/gauges/sparklines | No chart library |
| **Offline-first** | Every network call degrades gracefully; cached data + service worker |
| **Respect existing a11y** | ARIA roles, `focus-visible`, focus restore, `prefers-reduced-motion` |
| **All animation GPU-only** (`transform`/`opacity`) + reduced-motion gated | Perf + accessibility |

---

## 2. Data sources

| Source | What | Auth |
|---|---|---|
| **Cloudflare Worker** `https://tradescale-quotes.gsouyack26.workers.dev` | Live **stock** quotes (current price + day %) — hides the Finnhub key server-side | none (public proxy) |
| **CoinGecko** `api.coingecko.com/api/v3/...` | **Crypto** quotes (`/coins/markets` → price + 24h% + 168-pt 7d sparkline) and **OHLC** (`/coins/{id}/ohlc?vs_currency=usd&days=N` → candlesticks) | none (public) |
| **`trades.json`** | The disclosed-trade feed, refreshed by a **daily GitHub Action bot** (commits `chore: refresh live trade data`) | — |
| Finnhub (optional) | User can paste their own key (`ts_fhkey`) for real-time stocks; otherwise EOD | user key, localStorage only |

**Trade shape:** `{id,tid,ticker,co,action,shares,price,value,date,port,why,asset?}`
(`tid` = trader id, `asset` = "crypto" | undefined/stock, `action` = "BUY" | "SELL")

---

## 3. State & storage

Single state object **`S`** persisted to `localStorage["ts_state"]`:

```
budget, tab, action, sort, q, trader, asset, ttype,
watch, wsort, wsortDir, density, theme, wlCols, open{}, paper[]
```

`loadState()` has **two branches** (try-parse + catch-default) — **any new S field must be added to BOTH**.

| localStorage key | Purpose |
|---|---|
| `ts_state` | the `S` object |
| `ts_disc` | disclaimer-accepted flag (FOUC-prevention script reads it at parse time) |
| `ts_alerts` | user price alerts `[{id,ticker,target,dir,created,fired}]` |
| `ts_seen_ids` | disclosure-diff dedup (new-trade toasts) |
| `ts_auto` | auto price-move alert dedup (24h) |
| `ts_fhkey` | optional Finnhub API key |
| `ts_pf_hist` | daily portfolio-value snapshots `[{d:"YYYY-MM-DD",v}]` (cap 180) for the equity curve |
| `ts_views` | saved filter views `[{name,f:{q,trader,action,asset,ttype,sort}}]` (cap 20) |

---

## 4. Render architecture

`render()` is the single entry point (called on every state change):
1. sync `data-density` / `data-theme` on `<html>`
2. `banner()` — the "if you mirrored all buys" summary + buy/sell pressure gauge
3. `updateTape()` — ticker-tape marquee
4. `refreshSuggest()` **(only on watchlist tab — perf gate)**
5. dispatch to one of: `renderTrades` / `renderStrategies` / `renderPortfolio` / `renderWatchlist` / `renderSources`
6. `updatePfBadge()`, `animateCounts()`, tab-entrance class, `snapshotPortfolio()`, `save()`, `writeHash()`

**Each render fn rebuilds `#tab-body.innerHTML` wholesale** and then re-binds via `bindBody()` / `bindWatch()`. This is safe (old nodes + listeners are discarded with the old innerHTML). **Global** listeners (`document`/`window` keydown/click/contextmenu) live in a **single IIFE that runs once at parse time** — never re-bound.

Memoization: `consensus()`, `signals()`, `streaks()`, `leaderboard()` cache on `_memoTrades===trades`; `_invalidateMemo()` clears them.

Key helpers: `esc()` (XSS escape — **every data string interpolated into innerHTML must pass through it**), `fmt()` (currency), `scale(t,budget)` (budget-independent conviction: BIG/MEDIUM/SMALL + amounts), `curPrice(ticker)`, `sparkSvg(arr,pos)`, `filtered()`, `posPnl(pos)`.

---

## 5. Feature map (17 waves)

| Wave | Feature |
|---|---|
| 1 | **Intelligence layer** — `signals()` (CLUSTER_BUY / CROSSOVER / WHALE_ACCUM / COORD_SELL), `streaks()`, `leaderboard()`, SVG buy/sell `pressureGauge()` |
| 2 | **Alerts & notifications** — price alerts + tray, disclosure-diff toast, browser push, auto price-move |
| 3 | **Pro UX** — theme switcher (Quant/Bloomberg/Void), density toggle, ticker tape, sticky + sortable watchlist headers |
| 4 | **Command layer** — command palette (Ctrl+K, `buildCmds`), global hotkeys (1-5 / `/` `t` `d` `?`), ticker detail drawer, help modal |
| 5 | **Charts + analytics** — candlestick modal (`candleSvg`) w/ SMA/Bollinger/RSI, crosshair, 7/30/90d, `OHLC_CACHE`; portfolio `allocDonut()` + `riskMetrics()` |
| 6 | **Interaction** — right-click context menu (`showCtx`/`ctxItems`), typeahead datalist (`allKnownTickers`/`refreshSuggest`), copy-trader backtest (`backtestTrader`/`openBacktest`) |
| 7 | **Chart depth** — `emaArr`/`macdArr`, MACD(12,26,9) panel + EMA(50) overlay (viewBox 700×372), HHI concentration risk grade |
| 8 | **Equity** — daily snapshots (`snapshotPortfolio`/`pfHistory`), `equityCurveSvg`, `maxDrawdown`, `sharpeEst` |
| 9 | **Consensus Scanner** — `runScanner` multi-criteria filter modal (traders/direction/asset/signal/sort), click-through |
| 10 | **Custom columns** — `S.wlCols` gear menu (name/sparkline/type toggle, persisted) |
| 11 | **Import + views** — `parseImport`/`normImport` (CSV/JSON positions), saved filter views (`loadViews`/`applyView`/`saveCurrentView`) |
| 12 | **Review fixes** — 22 bug/perf/a11y fixes from a 3-agent code review (see §8) |
| 13 | **FX** — modal spring-in, staggered tab entrance, toast slide, equity-curve draw-in, chip pop, micro-interactions |
| 14 | **FX** — animated P&L count-ups (`_cv`/`animateCounts`), candlestick grow-in, banner sheen |
| 15 | **FX** — gradient title, skeleton-shimmer loading, active-tab underline, card glow, empty-state float, gauge needle sweep |
| 16 | **Tactile & delight** — click ripple on controls (delegated), confetti `burstFx()` + toast on a real paper-trade add (gated on `S.paper.length` growth), drifting header aurora glow |
| 17 | **Milestone FX** — theme-switch sheen wipe (`themeFx()`, detected centrally in `render()` so it covers buttons/hotkey/palette), new-all-time-high celebration (`celebrateAth()` from `snapshotPortfolio()`, guarded by `_athReady`/`_lastAth` so it never fires on load or re-fires on a flat value) |

---

## 6. Patch workflow (how edits are made safely)

Edits are applied with a **Python read-modify-write script** using an **assertion-guarded replace** and an **atomic write**:

```python
import os
F='.../tradescale.html'
s=open(F,encoding='utf-8').read()
def rep(old,new,label,n=1):
    c=s.count(old); assert c==n,'FAIL %s: %d!=%d'%(label,c,n); return s.replace(old,new,n)

s=rep('<anchor>','<replacement>','my-fix')      # aborts (no write) if anchor count != expected
# ... more reps ...

data=s.encode('utf-8','strict')                  # ATOMIC: temp file + os.replace
open(F+'.tmp','wb').write(data); os.replace(F+'.tmp',F)
```

**Why atomic:** `open(F,'w')` truncates *before* writing, so a mid-write encoding error nukes the file to 0 bytes. The `.tmp` + `os.replace` pattern makes a failed write leave the original untouched. (This bit once — recovered via `git checkout --`.)

**Assertion guard:** `rep()` asserts the anchor appears exactly `n` times; a mismatch aborts before any write, so the file is never half-patched.

**Emoji/surrogate gotcha:** in non-raw Python strings, surrogate-pair emoji (e.g. `\uD83D\uDC0B` 🐋) raise `UnicodeEncodeError`. Use **HTML entities** (`&#128011;`) in generated markup, or raw strings, or double-escape. BMP escapes (`\u2014`, `\u25B2`) are fine.

**String-escaping reality:** deeply nested JS-in-Python-in-shell quoting is fragile. When `rep()` anchors fail on quote-heavy lines, fall back to **direct `s.replace()` with a `count==1` assert** and simpler substrings, or the `edit` built-in.

---

## 7. Verification (mandatory after every change)

Two-gate system, both run before any commit:

**A. Syntax** — extract the largest `<script>` block, `node --check`:
```
[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).reduce((a,b)=>b.length>a.length?b:a,'')
```
(The app has 2 `<script>` tags: a tiny FOUC-prevention one + the main one — always take the largest.)
> A `ReferenceError: document is not defined` is **expected and fine** — only a `SyntaxError` fails the gate.

**B. Harnesses** — 17 VM-based test harnesses in `~/.aki/tmp/` (`wl_test`, `ts_stocklive`, `ts_upgrades`, `ts_v3`, `ts_wave1..15`), 220+ assertions. Each loads the file, extracts the main script, runs it in a `vm` context with a **stubbed DOM**, and asserts on both runtime behavior (functions) and source markers (`html.includes(...)`).

To build a new wave harness: `head -40 ts_upgrades.mjs > ts_waveN.mjs` (line 40 closes the sample-data template), then append `chk()`/`src()` assertions + `process.exit(fail?1:0)`.

**Harness DOM-stub gotchas (add to `mkEl()` / the `document` stub / the `ctx` as needed):**
`addEventListener`, `removeEventListener`, `querySelector`, `querySelectorAll`, `closest`, `scrollIntoView`, `activeElement`, `clearTimeout`, `setTimeout`, `matchMedia`, `requestAnimationFrame`. Real browsers have these — a missing stub is a **harness gap, not an app bug** (fix the stub).

**Common false-fail:** assertion *test strings* with nested escaped quotes (`data-x=\"y\"`) break the vm eval, and ambiguous float rounding (`7.25.toFixed(1)`). These are test bugs — fix the test, not the app.

---

## 8. 3-agent code review (Wave 12)

Spawned 3 parallel `akira` plan-mode agents — **Bugs**, **Perf**, **UX/a11y** — each reporting to a file / message. 34 findings; all HIGH/MED + most LOW implemented:

- **Bugs:** UTC→local dates (`localDate()`), MACD signal EMA anchoring, chart fetch race (`_chartKey`), allocDonut single-position full ring, `renderCmdk` XSS `esc()`, context-menu stale closure, `parseImport` column guard, `riskMetrics` tot=0 guard, import quota detection.
- **Perf:** `refreshSuggest` gated to watchlist tab, `snapshotPortfolio` localStorage early-exit, `OHLC_CACHE` LRU cap (30), confirmed no listener leaks.
- **UX/a11y:** **`var(--text)` was undefined** (14 broken refs → `var(--text-primary)`), WCAG AA contrast (`--text-secondary` for `.ci-hint`/`.rc-l`, sig-whale Void `#9b7fff`), removed over-announcing `aria-live`, focus-restore on all modals, keyboard access for ticker spans + scanner rows, `imp-box` max-height, bigger tap targets.

---

## 9. Animation system (Waves 13–17)

- All effects use **only `transform` / `opacity`** (compositor-friendly).
- **Every** new animation is disabled in the extended `@media(prefers-reduced-motion:reduce)` block (kept in lockstep each wave).
- **SVG draw-in trick:** `pathLength="1"` + `stroke-dasharray:1` + animate `stroke-dashoffset:1→0` — scale-independent, used by the equity curve and pressure-gauge needle.
- **Count-ups:** `_cv(key,val,pre,suf,dec)` renders a `<span class="cv" data-cv…>`; `animateCounts()` rAF-tweens changed values (compares `_cvPrev[key]`), skips if no `requestAnimationFrame` (harness-safe) or reduced-motion.
- **Entrance gating:** tab-content cascade fires only on real tab change (`_prevRenderTab`), not on 30s quote-refresh re-renders.
- **Candles grow-in:** `transform-box:fill-box; transform-origin:center bottom; scaleY` — final state is identity so it's correct even if `transform-box` is unsupported.
- **Ripple** (`.rp`): one delegated `document` click listener matches a fixed set of self-contained rounded controls (which get `position:relative;overflow:hidden`); a sized `<span>` is placed at the click point, animated `scale`, removed after 520ms. Skipped early when `_reduceFx()`.
- **Confetti** (`burstFx(x,y)`): spawns a `position:fixed` wrapper of 18 `<i>` particles with randomized `--cx/--cy/--cr/--cd` custom props → `confPop` keyframe; wrapper removed after 1.4s. Fired from the paper-add handler **only when a trade was actually added** (guards against dup/budget early-returns), paired with a success toast.
- **Header aurora** (`.header::before`): two soft radial gradients drift horizontally (`auroraDrift`, `translateX` only). Kept to `inset:0` deliberately — **no `overflow:hidden` on the header** so keyboard focus rings on the theme/density buttons are never clipped.
- **Dual reduced-motion guard:** FX are disabled in both CSS (`.header::before`, `.rp,.conf` set to `animation:none!important`) **and** JS (`_reduceFx()` returns early in `burstFx`/ripple), so nothing spawns even if CSS is bypassed.
- **Theme sheen wipe** (`#theme-wipe`): a light diagonal gradient sweeps once on theme change. Detected centrally in `render()` (`_prevTheme`) so it fires regardless of trigger (button, `t` hotkey, command palette) without wiring each site.
- **All-time-high celebration** (`celebrateAth`): `snapshotPortfolio()` computes the prior peak **before** mutating history, then celebrates only a genuine new high. `_athReady` skips the first snapshot per session (no spam on reload at an ATH); `_lastAth` debounces so a flat/unchanged value never re-fires. Needs ≥2 days of history to be meaningful.

---

## 10. Git & deploy

- Commit identity: `git -c user.name='gsouyack26-creator' -c user.email='gsouyack26@users.noreply.github.com'`
- Always `export GIT_EDITOR=true`.
- **Before push:** `git pull --rebase origin main` — the daily bot pushes `trades.json`, so local can be behind.
- CRLF warning on commit is harmless (git stores LF; live-vs-local byte delta is only line endings — `diff` confirms identical content).
- Push → GitHub Pages redeploys in ~15-25s; verify `curl -s -o /dev/null -w "%{http_code}" <live-url>` returns `200`.
