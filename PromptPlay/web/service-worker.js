// PromptPlay Service Worker
// Hand-authored template — manifest injected by workbox-build injectManifest at build time
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Claim clients immediately so the new SW controls pages without reload
clientsClaim();

// Inject precache manifest (populated by workbox-build injectManifest)
// This caches the app shell: JS, CSS, HTML from the static export
precacheAndRoute(self.__WB_MANIFEST);

// Skip waiting so updated SW activates immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Route 1: App shell resources (scripts + stylesheets) — CacheFirst
// These are hashed by the bundler, so stale-while-revalidate isn't needed
registerRoute(
  ({ request }) =>
    request.destination === 'script' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'app-shell',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 60 }),
    ],
  })
);

// Route 2: Lesson content JSON — CacheFirst (bundled static JSON, content is versioned)
// Matches /assets/ paths and lesson JSON files
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/assets/') && url.pathname.endsWith('.json'),
  new CacheFirst({
    cacheName: 'lesson-content',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Route 3: Images — StaleWhileRevalidate
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Route 4: Lottie JSON animation files — StaleWhileRevalidate
registerRoute(
  ({ url }) =>
    url.pathname.endsWith('.json') && url.pathname.includes('lottie'),
  new StaleWhileRevalidate({
    cacheName: 'lottie-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);
