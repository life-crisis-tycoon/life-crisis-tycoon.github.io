// Offline cache. Code (html/js) always comes from the network first, bypassing the browser cache, so an update shows on the
// next open; models/images are served from cache but refreshed in the background (stale-while-revalidate).
const V = 'lct-v3';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== V) await caches.delete(k); await self.clients.claim(); })()));
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.endsWith('supabase.co')) return; // never cache saves or sign-in
  const heavy = /\/models\/|\/assets\/|\/icons\/|cdn\.jsdelivr\.net/.test(u.href);
  e.respondWith((async () => {
    const c = await caches.open(V);
    if (heavy) {
      const hit = await c.match(e.request);
      const net = fetch(e.request, { cache: 'no-cache' }).then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      const r = await net; if (r) return r; throw new Error('offline');
    }
    try { const r = await fetch(e.request, { cache: 'no-store' }); if (r.ok && u.origin === location.origin) c.put(e.request, r.clone()); return r; }
    catch (err) { const hit = await c.match(e.request); if (hit) return hit; throw err; }
  })());
});
