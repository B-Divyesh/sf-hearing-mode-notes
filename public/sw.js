const CACHE = "hearing-mode-notes-v6";
const SHELL = ["/", "/index.html", "/demo", "/history", "/settings", "/privacy", "/terms", "/404.html", "/offline.html", "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png", "/social-card.webp", "/assets/notebook-hero-480.webp", "/assets/notebook-hero-720.webp", "/assets/notebook-hero-1280.webp"];
const APP_ROUTES = new Set(["/", "/index.html", "/demo", "/history", "/settings", "/privacy", "/terms", "/404.html"]);

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const html = await (await fetch("/index.html")).text();
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
    await cache.addAll(assets);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((client) => client.postMessage({ type: "SW_UPDATED" }));
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      // App routes are precached so an offline reload never depends on a
      // network race. Unknown routes still reach the server while online,
      // preserving an upstream 404 instead of turning it into the shell.
      if (APP_ROUTES.has(url.pathname)) {
        const cached = await cache.match(event.request, { ignoreVary: true });
        if (cached) return cached;
      }
      try {
        const fresh = await fetch(event.request);
        if (fresh.ok) cache.put(event.request, fresh.clone());
        return fresh;
      } catch {
        // An offline reload can use a route copy or the cached app shell. Online
        // requests always preserve the server's status, including real 404s.
        return (await cache.match(event.request, { ignoreVary: true })) || (await cache.match("/index.html")) || (await cache.match("/offline.html"));
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) (await caches.open(CACHE)).put(event.request, response.clone());
      return response;
    } catch {
      return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
    }
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
