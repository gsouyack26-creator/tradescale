// TradeScale service worker - offline app shell, fresh data
const CACHE = "tradescale-v4";
const SHELL = [
  "./",
  "./tradescale.html",
  "./icon-192.png",
  "./icon-512.png",
  "./manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Data: network-first, cache without query params so ?t= cache-buster doesn't break offline fallback
  if (url.pathname.endsWith("trades.json")) {
    const cacheKey = new Request(url.origin + url.pathname); // strip ?t= timestamp
    e.respondWith(
      fetch(e.request).then((r) => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(cacheKey, copy));
        }
        return r;
      }).catch(() => caches.match(cacheKey).then(r => r || Response.error()))
    );
    return;
  }

  // App shell: cache-first
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
