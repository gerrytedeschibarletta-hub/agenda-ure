/* Service worker dell'app Agenda URE.
   Conserva solo il "guscio" (pagina e icone) per aprirsi anche con rete lenta;
   i dati dell'agenda arrivano sempre dal Foglio Google.
   Le notifiche push sono gestite da OneSignal. */
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
const CACHE = 'agenda-ure-v8';
const SHELL = ['./', 'index.html', 'manifest.webmanifest',
  'icons/icon-192-v2.png', 'icons/icon-512-v2.png', 'icons/apple-touch-icon-v2.png', 'icons/favicon-32-v2.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
