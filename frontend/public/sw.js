/**
 * PRAHARI Service Worker — Offline-First PWA
 *
 * Strategy:
 *  - API responses (villages, shelters, alerts, roads) → Cache-First with network fallback
 *  - Map tiles → Cache-First (offline map viewing)
 *  - Field reports made offline → queued in IndexedDB, sync on reconnect
 *  - Static assets → Stale-While-Revalidate
 */

const CACHE_NAME    = 'prahari-v3';
const TILE_CACHE    = 'prahari-tiles-v1';
const OFFLINE_DB    = 'prahari-offline-queue';

const API_CACHE_URLS = [
  '/api/villages',
  '/api/shelters',
  '/api/roads',
  '/api/alerts',
  '/api/config',
];

const TILE_ORIGINS = [
  'tile.openstreetmap.org',
  'server.arcgisonline.com',
  'tile.openweathermap.org',
];

// ── Install: pre-cache the app shell ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        '/',
        '/index.html',
      ]).catch(() => {}) // don't block install if shell not yet built
    )
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE_NAME && k !== TILE_CACHE)
        .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: handle requests ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Map tiles → Cache-First (essential for offline map viewing)
  if (TILE_ORIGINS.some(o => url.hostname.includes(o))) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request.clone());
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return cached || new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // API endpoints → Network-First with cache fallback
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        try {
          const response = await fetch(request.clone());
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ error: 'Offline — cached data may be stale', offline: true }),
            { headers: { 'Content-Type': 'application/json' }, status: 503 }
          );
        }
      })
    );
    return;
  }

  // POST to /api/field-reports when offline → queue in IndexedDB
  if (url.pathname === '/api/field-reports' && request.method === 'POST') {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        // Store in offline queue
        const body = await request.clone().json();
        await queueOfflineReport({ ...body, _queued: true, _queuedAt: new Date().toISOString() });
        return new Response(
          JSON.stringify({ success: true, offline: true, message: 'Saved offline — will sync when connected' }),
          { headers: { 'Content-Type': 'application/json' }, status: 202 }
        );
      })
    );
    return;
  }

  // Static assets → Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request.clone()).then(res => {
        if (res.ok) cache.put(request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-field-reports') {
    event.waitUntil(syncOfflineReports());
  }
});

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'PRAHARI Alert', {
      body:  data.body  || 'New landslide risk alert',
      icon:  '/icon-192.png',
      badge: '/icon-96.png',
      data:  data,
      requireInteraction: data.severity === 'CRITICAL',
      actions: [
        { action: 'view',   title: '👁 View Alert' },
        { action: 'dismiss', title: 'Dismiss' },
      ]
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view') {
    event.waitUntil(clients.openWindow('/'));
  }
});

// ── IndexedDB helpers ─────────────────────────────────────────────────────────
async function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(OFFLINE_DB, 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('reports')) {
        db.createObjectStore('reports', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess  = e => resolve(e.target.result);
    req.onerror    = e => reject(e.target.error);
  });
}

async function queueOfflineReport(report) {
  const db    = await openDB();
  const tx    = db.transaction('reports', 'readwrite');
  const store = tx.objectStore('reports');
  store.add(report);
  return tx.complete;
}

async function syncOfflineReports() {
  const db      = await openDB();
  const tx      = db.transaction('reports', 'readwrite');
  const store   = tx.objectStore('reports');
  const reports = await new Promise((res, rej) => {
    const req = store.getAll();
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });

  for (const report of reports) {
    try {
      const { id, ...body } = report;
      const res = await fetch('/api/field-reports', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (res.ok) store.delete(id);
    } catch { /* retry next time */ }
  }
}
