# TradeScale spec-writing brief (READ FIRST)

You are writing an IMPLEMENTATION SPEC only. Do NOT edit any file — your writes won't
reach this disk. The lead agent applies your spec. Return the spec as your chat reply.

## The app
- Single file: `C:\Users\souyackg\Dev\scratch\tradescale\tradescale.html` (~222KB, one big <script>).
- Vanilla JS, no framework. Offline PWA following "smart money" (whales/congress/crypto) trades.
- State object `S` (localStorage `ts_state`) loaded via `loadState()` which has TWO default
  branches (a try branch reading `s.*`, and a catch branch with literals) — ANY new S.* field
  MUST be added to BOTH branches.
- `save()` persists S and is HARD-GUARDED in read-only mode (`RO===true`): it no-ops. Snapshot
  viewers run with RO=true; never bypass it.
- Rendering: `render()` dispatches to per-tab renderers. Portfolio tab = `renderPortfolio()`.
  Inside it: `posCard(pos)` builds one position card; `sortedPositions()`/`groupedPositions()`
  order them; the analytics block is `allocDonut()+riskMetrics()+equityCurveSvg(pfHistory())+attributionCard()`.

## Reusable functions you may call (do not redefine)
- `esc(s)` HTML-escape · `fmt(n)` number format · `curPrice(ticker)` live price or null
- `posPnl(pos)` -> {cur,pnl,val,pct,noQuote} · `id("elId")` = getElementById
- Position shape: {pid,ticker,co,dir("LONG"/"SHORT"),entry,shares,cost,date("YYYY-MM-DD"),spyEntry,who,fund,note?}
- `S.paper` = active portfolio positions array. `S.budget` number.

## What your spec MUST contain
1. New function(s): full JS source, ES5-style (var, function), matching the file's style.
2. Exact insertion anchors: quote a UNIQUE string that literally exists in the file today, and
   say whether your code goes before/after it. (The lead uses assert-guarded string replace,
   so anchors must be exact and unique.)
3. Any new `S.*` field: give the exact line to add to BOTH loadState branches.
4. CSS: give the rules + a unique existing CSS string to anchor after.
5. Event binding code (if any) + where in renderPortfolio's bind tail it goes.
6. RO behavior: state explicitly how your feature behaves when RO===true.
7. Harness assertions: ~8-12 checks (source-string `src(label,bool)` and/or runtime
   `chk(label,'jsExpr')`) the lead can drop into a Node harness. Runtime exprs run inside a vm
   with S, posPnl, your fns in scope; reassign whole objects (e.g. `S.paper=[...]`) — never rely
   on property mutation propagating.

## Conventions / gotchas
- Emoji/glyphs as \uXXXX escapes in JS strings.
- Keep blast radius tiny; reuse existing fns; no new libraries.
- Feature must be a pure additive increment; don't change existing function signatures.

## Delivery rules (READ)
- PASTE your entire spec as literal plain text in your FINAL reply. Do NOT write any file. Do NOT use shell substitution or reference a temp file — the lead cannot read your disk or your thread, only your message text.
- Give the COMPLETE verbatim spec in one message: full JS source, each exact unique anchor string (say before/after), CSS + its anchor, any S.* default lines for BOTH loadState branches, event-binding code, RO behavior, and 8-12 harness assertions.
- Lead harness: source-string checks read `js` (the script block) or `html` (the style block, where CSS lives); runtime checks are chk with a JS-expression STRING eval'd in a vm with S/posPnl/your fns in scope. Reassign whole objects (S.paper=[...]), never rely on property-mutation propagation.
