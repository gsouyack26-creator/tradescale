// TradeScale quote proxy — keeps the Finnhub API key server-side.
// - CORS locked to the app origin(s)
// - short edge cache per symbol so many visitors cost few upstream calls (protects the free tier)
// - the key lives only as a Worker secret (env.FINNHUB_KEY), never in client code

const ALLOWED = [
  "https://gsouyack26-creator.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];
const DEFAULT_ORIGIN = "https://gsouyack26-creator.github.io";
const CACHE_TTL = 20; // seconds

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const allowOrigin = ALLOWED.includes(origin) ? origin : DEFAULT_ORIGIN;
    const cors = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "GET") return json({ error: "method not allowed" }, 405, cors);

    const url = new URL(request.url);
    const symbol = (url.searchParams.get("symbol") || "")
      .toUpperCase().replace(/[^A-Z0-9.\-:]/g, "").slice(0, 12);
    if (!symbol) return json({ error: "missing symbol" }, 400, cors);
    if (!env.FINNHUB_KEY) return json({ error: "proxy not configured" }, 500, cors);

    const cache = caches.default;
    const cacheKey = new Request("https://quote-cache.internal/?s=" + symbol);
    const cached = await cache.match(cacheKey);
    if (cached) return withCors(cached, cors);

    let up;
    try {
      up = await fetch(
        "https://finnhub.io/api/v1/quote?symbol=" + encodeURIComponent(symbol) + "&token=" + env.FINNHUB_KEY,
        { cf: { cacheTtl: CACHE_TTL, cacheEverything: true } }
      );
    } catch (e) {
      return json({ error: "upstream unreachable" }, 502, cors);
    }
    const body = await up.text();
    const resp = new Response(body, {
      status: up.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=" + CACHE_TTL },
    });
    if (up.ok) ctx.waitUntil(cache.put(cacheKey, resp.clone()));
    return withCors(resp, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: Object.assign({ "Content-Type": "application/json" }, cors),
  });
}
function withCors(resp, cors) {
  const r = new Response(resp.body, resp);
  for (const k in cors) r.headers.set(k, cors[k]);
  return r;
}
