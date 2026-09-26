// Offline support for dobble-game — precaches every asset, network-first for the page itself.
const CACHE = 'dobble-game-BZoFD3g4';
const ASSETS = [
  "/dobble-game/",
  "/dobble-game/index.html",
  "/dobble-game/manifest.webmanifest",
  "/dobble-game/icon-192.png",
  "/dobble-game/icon-512.png",
  "/dobble-game/assets/dobble-hero-DzrfIdPL.png",
  "/dobble-game/assets/index-B7JDY84b.js",
  "/dobble-game/assets/index-BZoFD3g4.css"
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE).then((cache) => cache.put('/dobble-game/index.html', copy));
                    return res;
                })
                .catch(() => caches.match('/dobble-game/index.html'))
        );
        return;
    }
    event.respondWith(
        caches.match(req).then((hit) => hit || fetch(req).then((res) => {
            if (res.ok && req.url.includes('/dobble-game/')) {
                const copy = res.clone();
                caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
        }))
    );
});
