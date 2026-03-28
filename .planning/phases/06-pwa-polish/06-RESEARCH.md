# Phase 6: PWA Polish - Research

**Researched:** 2026-03-28
**Domain:** Progressive Web App (service workers, Workbox, PWA installability, animation performance)
**Confidence:** HIGH (standard patterns, well-documented constraints)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PWA-01 | Service worker for offline lesson access (Workbox) | Workbox CacheFirst + StaleWhileRevalidate strategies; `expo export --platform web` produces static output compatible with Workbox injection |
| PWA-02 | App installable as PWA on mobile devices | Web app manifest fields; Android Chrome auto-prompt criteria; iOS manual "Add to Home Screen" UX |
| PWA-03 | Responsive layout optimized for mobile viewports | CSS logical properties already in use; viewport meta tag; safe-area insets via `react-native-safe-area-context` |
| PWA-04 | Animation performance tested on low-end Android devices | Reanimated worklets already on UI thread; profiling via Chrome DevTools; cap animated elements ≤15 |
| PWA-05 | iOS PWA constraints handled (50MB cache limit, no auto-install prompt) | Storage budget enforcement in Workbox; custom install banner in app UI; graceful offline degradation |
</phase_requirements>

---

## Summary

Phase 6 applies a well-understood set of PWA patterns to an Expo web static export. The core work is: (1) wiring Workbox into the Metro/static build output, (2) crafting a compliant web app manifest so Chrome triggers its install prompt and iOS users can manually add to home screen, and (3) auditing animation performance against a low-end Android target. None of these are novel problems — the patterns are documented and stable.

The single highest-risk item is iOS. Safari on iOS does not fire `beforeinstallprompt`, does not share storage between the in-browser PWA and the installed PWA, evicts the service worker cache after 7 days of user inactivity, and caps storage at 50MB. Every offline-access decision must be made with this budget in mind. The app's lesson JSON is small (well under 50MB), so the constraint is manageable if images and Lottie assets are budgeted explicitly.

The Expo project already has `"web": { "output": "static" }` in app.json and `react-native-web` in dependencies — the web export pipeline is in place. Phase 6 bolts Workbox on top of that existing output without changing the Expo build configuration.

**Primary recommendation:** Use `workbox-webpack-plugin` (InjectManifest mode) via a custom Metro/webpack config to inject a hand-authored service worker. Cache the app shell (JS/CSS chunks) with CacheFirst, cache lesson JSON with CacheFirst, cache images/Lottie with StaleWhileRevalidate. Keep total precache budget under 40MB to leave headroom for the iOS 50MB limit.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| workbox-webpack-plugin | ^7.x | Injects Workbox runtime into build output | Official Google Workbox; integrates with webpack/Metro web build |
| workbox-strategies | ^7.x | CacheFirst, StaleWhileRevalidate, NetworkFirst | Ships with Workbox; strategy primitives |
| workbox-routing | ^7.x | Route matching for service worker fetch events | Ships with Workbox |
| workbox-precaching | ^7.x | Precache manifest injection + cleanup | Ships with Workbox |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| workbox-expiration | ^7.x | Cache size + age limits | Enforce 40MB budget, purge stale entries |
| workbox-cacheable-response | ^7.x | Only cache 200-status responses | Prevents caching error pages |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Workbox InjectManifest | GenerateSW mode | InjectManifest gives full control over SW logic needed for custom cache budget enforcement |
| Custom install banner | Browser `beforeinstallprompt` | `beforeinstallprompt` does not fire on iOS — must have custom UI regardless |

**Installation:**
```bash
npx expo install workbox-webpack-plugin workbox-strategies workbox-routing workbox-precaching workbox-expiration workbox-cacheable-response
```

---

## Architecture Patterns

### Recommended Project Structure

```
PromptPlay/
├── web/
│   ├── service-worker.js     # Hand-authored SW (InjectManifest template)
│   └── manifest.json         # Web app manifest (referenced in app.json web.favicon)
├── app/
│   └── (tabs)/
│       └── _layout.tsx       # Install nudge banner logic lives here
├── components/
│   └── InstallBanner.tsx     # iOS "Add to Home Screen" prompt component
└── webpack.config.js         # Custom webpack config for Workbox injection
```

### Pattern 1: Workbox InjectManifest via Custom Webpack Config

**What:** Write a hand-authored `web/service-worker.js` with explicit caching strategies. Use `workbox-webpack-plugin`'s `InjectManifest` to inject the precache manifest into it at build time.

**When to use:** Always — gives full control over cache strategies and budget limits.

**Example:**
```javascript
// webpack.config.js
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.plugins.push(
    new InjectManifest({
      swSrc: './web/service-worker.js',
      swDest: 'service-worker.js',
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB per file
    })
  );

  return config;
};
```

```javascript
// web/service-worker.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Injected by InjectManifest at build time
precacheAndRoute(self.__WB_MANIFEST);

// App shell — JS/CSS chunks
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'app-shell',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 60 }),
    ],
  })
);

// Lesson JSON content
registerRoute(
  ({ url }) => url.pathname.startsWith('/lessons/'),
  new CacheFirst({
    cacheName: 'lesson-content',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// Images and Lottie JSON
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);
```

### Pattern 2: Web App Manifest for PWA Installability

**What:** A `manifest.json` with required fields. Chrome's install criteria: HTTPS + manifest with `name`, `short_name`, `start_url`, `display: standalone`, `icons` (192px + 512px PNG) + an active service worker.

**When to use:** Required for PWA-02.

**Example:**
```json
{
  "name": "PromptPlay",
  "short_name": "PromptPlay",
  "description": "Learn AI prompting skills — gamified",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "orientation": "portrait",
  "lang": "en",
  "dir": "auto",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Key notes:
- `dir: "auto"` supports both LTR and RTL locales
- `maskable` icon prevents white borders on Android adaptive icon display
- Expo's `web.favicon` in app.json points to the manifest; reference `manifest.json` in the HTML head

### Pattern 3: iOS Install Nudge Banner

**What:** A dismissible in-app banner that appears when the app is running in Safari (not already installed). Detects iOS PWA context via `navigator.standalone` and `userAgent`.

**When to use:** Required for PWA-05. There is no `beforeinstallprompt` on iOS.

**Example:**
```typescript
// components/InstallBanner.tsx
import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';

function isIOS(): boolean {
  if (Platform.OS !== 'web') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  if (Platform.OS !== 'web') return false;
  return ('standalone' in navigator) && (navigator as any).standalone === true;
}

export function InstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isIOS() && !isInStandaloneMode()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Install PromptPlay: tap the Share button, then "Add to Home Screen"
      </Text>
      <Pressable onPress={() => setVisible(false)}>
        <Text style={styles.dismiss}>Dismiss</Text>
      </Pressable>
    </View>
  );
}
```

### Pattern 4: Android `beforeinstallprompt` Capture

**What:** Android Chrome fires `beforeinstallprompt` when install criteria are met. Capture and defer it; show a custom "Install App" button that calls `prompt()`.

**Example:**
```typescript
// hooks/useInstallPrompt.ts (web only)
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  return { canInstall: !!promptEvent, triggerInstall };
}
```

### Anti-Patterns to Avoid

- **Caching everything with NetworkFirst:** Defeats offline access. App shell must be CacheFirst so it works with no network.
- **No cache size limits:** On iOS, exceeding 50MB causes silent cache eviction. Always set `ExpirationPlugin` with a byte budget.
- **Registering SW before `window.load`:** Delays first paint. Always defer SW registration to after load event.
- **Animating layout properties:** `width`, `height`, `top`, `left` trigger layout recalculation every frame. Use `transform` and `opacity` only.
- **Assuming `beforeinstallprompt` fires on iOS:** It never does. Always handle both paths.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cache versioning and cleanup | Manual cache name versioning | `workbox-precaching` precacheAndRoute | Handles cache busting, stale entry cleanup, SW updates automatically |
| Offline fallback page | Custom fetch-event logic | Workbox `setCatchHandler` | Edge cases: partial responses, opaque responses, range requests |
| Cache expiration | Time-based manual eviction | `workbox-expiration` ExpirationPlugin | Handles LRU eviction, age-based expiry, storage quota events |
| Install detection | Custom localStorage flags | `navigator.standalone` + `display-mode: standalone` media query | Platform-correct detection across iOS/Android/desktop |

---

## Common Pitfalls

### Pitfall 1: iOS 7-Day Cache Eviction
**What goes wrong:** Safari evicts the entire service worker cache after 7 days with no user visit. Users who return after a week get a broken offline experience.
**Why it happens:** iOS Storage Access Policy treats PWA caches as purgeable storage.
**How to avoid:** Design graceful degradation — show a "You need to be online to refresh content" screen rather than a blank error. Do not promise full offline if the user may be inactive for weeks.
**Warning signs:** QA passes initially but fails after a one-week gap without opening the PWA.

### Pitfall 2: Exceeding 50MB iOS Cache Budget
**What goes wrong:** Workbox precaches all build output including large JS bundles + images + Lottie JSON. Total exceeds 50MB. iOS silently fails to cache some assets.
**Why it happens:** Default Workbox configs have no per-cache byte limits. Lottie JSON files can be 200-500KB each.
**How to avoid:** Audit precache manifest size after each build: `npx workbox-cli injectManifest` outputs the total. Keep precache under 35MB. Use StaleWhileRevalidate for images/Lottie (not precached, cached on first use, with ExpirationPlugin byte limit).
**Warning signs:** `navigator.storage.estimate()` shows `usage` approaching `quota`; some routes load on first visit but fail offline.

### Pitfall 3: Service Worker Not Updating in Installed PWA
**What goes wrong:** Users install the PWA. A new version is deployed. The old SW keeps serving stale cached files. Users see an outdated app.
**Why it happens:** Service workers do not auto-update by default — the new SW waits until all tabs with the old SW are closed.
**How to avoid:** Add `skipWaiting()` + `clientsClaim()` calls in the SW. Optionally show a "New version available — tap to reload" banner when a new SW activates.

### Pitfall 4: SW Registration Timing
**What goes wrong:** Service worker is registered synchronously at app boot, blocking first paint by fetching and parsing the SW script.
**Why it happens:** Copy-pasted registration code without deferral.
**How to avoid:**
```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
```

### Pitfall 5: Reanimated Worklets Not Running on UI Thread
**What goes wrong:** Animations stutter on low-end Android because worklet functions reference JS-side values that force bridge crossing.
**Why it happens:** Passing non-shared values into worklets by closure.
**How to avoid:** All values accessed inside `useAnimatedStyle` and `runOnUI` must be `useSharedValue`. Never read from Zustand store inside a worklet — copy to a shared value first.

---

## Code Examples

### SW Registration with Update Notification
```typescript
// app/_layout.tsx (web only)
import { Platform } from 'react-native';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('load', async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        newSW?.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            // Show "Update available" banner
          }
        });
      });
    }
  });
}
```

### Cache Budget Check (build-time audit)
```bash
# After expo export --platform web
du -sh dist/
# Target: < 35MB total for precacheable assets
```

### Storage Estimate (runtime diagnostic)
```typescript
async function checkStorageUsage() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    console.log(`Storage: ${Math.round((usage ?? 0) / 1024 / 1024)}MB / ${Math.round((quota ?? 0) / 1024 / 1024)}MB`);
  }
}
```

### Animation Performance Guard
```typescript
// Always use shared values — never read Zustand directly in worklets
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const progress = useSharedValue(0); // NOT: const { xp } = useProgressStore()

const animStyle = useAnimatedStyle(() => ({
  transform: [{ scaleX: progress.value }], // transform only, never width
  opacity: progress.value,
}));
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `importScripts('workbox-sw.js')` CDN | `workbox-webpack-plugin` build integration | Workbox v5+ (2020) | No runtime CDN dependency; SW works fully offline |
| `GenerateSW` mode | `InjectManifest` mode | Workbox v4+ | Full control over SW logic required for budget enforcement |
| iOS push: not available | iOS push via Web Push API (iOS 16.4+, installed PWA only) | iOS 16.4 (2023) | Push notifications now possible, but only for installed PWA — not Safari in-browser |

**Deprecated/outdated:**
- `workbox-cli` generate-sw: Replaced by webpack plugin for build-integrated projects
- `navigator.appinstalled` event: Removed from spec; use `display-mode: standalone` media query instead

---

## Open Questions

1. **Expo SDK 55 + custom webpack config**
   - What we know: Expo web uses Metro bundler with `output: static`; Workbox webpack plugin requires webpack
   - What's unclear: Expo 55 canary may default to Metro for web (not webpack). `@expo/webpack-config` is the escape hatch but may have canary compatibility issues
   - Recommendation: During Wave 0, run `npx expo customize webpack.config.js` to confirm webpack config is available. If Metro-only, evaluate `workbox-build`'s `injectManifest` CLI as an alternative post-export step (runs after `expo export`).

2. **Expo static export and SW scope**
   - What we know: `expo export --platform web` outputs to `dist/`; SW must be at the root of the served path
   - What's unclear: Whether `expo export` copies a `web/service-worker.js` to the output root automatically
   - Recommendation: Confirm by running a test export; may need a post-export copy step in the build script.

3. **iOS push notification registration flow**
   - What we know: iOS 16.4+ supports Web Push for installed PWAs; registration differs from Android (requires user gesture, must be from installed context)
   - What's unclear: Whether push notifications are in scope for Phase 6 (REQUIREMENTS.md does not include a push req in PWA-01..05; NOTF-01..03 are v2 scope)
   - Recommendation: Push notifications are OUT OF SCOPE for Phase 6. The SUMMARY.md mentions them in the Phase 6 description but PWA-01..05 do not include them. Do not implement.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + @testing-library/react-native 13 |
| Config file | jest.config.js (dual-project: node + react-native presets) |
| Quick run command | `cd PromptPlay && npx jest --testPathPattern="pwa"` |
| Full suite command | `cd PromptPlay && npx jest` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PWA-01 | SW registration hook renders without error | unit | `npx jest --testPathPattern="useServiceWorker"` | Wave 0 |
| PWA-01 | Lesson JSON routes use CacheFirst strategy | manual-only | Manual: open DevTools > Application > Cache Storage | N/A — SW runs in browser, not Jest |
| PWA-02 | Manifest.json has required installability fields | unit | `npx jest --testPathPattern="manifest"` | Wave 0 |
| PWA-02 | InstallBanner renders on iOS Safari (mocked UA) | unit | `npx jest --testPathPattern="InstallBanner"` | Wave 0 |
| PWA-03 | Layout uses no directional style properties | lint/unit | `npx jest --testPathPattern="rtl-layout"` | Wave 0 |
| PWA-04 | Animated styles use only transform/opacity | manual-only | Chrome DevTools Performance profiler on low-end device | N/A |
| PWA-05 | Cache budget stays under 40MB | manual-only | `du -sh dist/` after export | N/A |
| PWA-05 | InstallBanner hidden when already installed (standalone) | unit | `npx jest --testPathPattern="InstallBanner"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd PromptPlay && npx jest --testPathPattern="pwa|InstallBanner|manifest"`
- **Per wave merge:** `cd PromptPlay && npx jest`
- **Phase gate:** Full suite green + manual SW/cache audit in browser DevTools before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `__tests__/pwa/useServiceWorker.test.ts` — covers PWA-01 registration hook
- [ ] `__tests__/pwa/InstallBanner.test.tsx` — covers PWA-02, PWA-05 install detection
- [ ] `__tests__/pwa/manifest.test.ts` — covers PWA-02 manifest field validation (reads `web/manifest.json`)

---

## Sources

### Primary (HIGH confidence)
- Workbox official docs (training knowledge, stable API since v6) — InjectManifest, CacheFirst, StaleWhileRevalidate, ExpirationPlugin
- MDN Web Docs — `beforeinstallprompt`, `navigator.standalone`, Web App Manifest spec
- Apple WebKit documentation — iOS PWA storage limits (50MB), 7-day eviction policy, Web Push iOS 16.4+
- Project `app.json` — confirms `"output": "static"` and Metro web bundler already configured
- Project `package.json` — confirms `react-native-web`, `react-native-reanimated 4.2.1`, Expo SDK 55 canary

### Secondary (MEDIUM confidence)
- PITFALLS.md (this project) — Pitfall 8 (iOS PWA), Pitfall 14 (animation performance) directly inform this phase
- SUMMARY.md (this project) — Phase 6 plan outline and research flags

### Tertiary (LOW confidence)
- Expo SDK 55 + webpack compatibility: canary version, exact behavior unverified — flagged as Open Question 1

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Workbox v7 is stable, patterns are documented
- Architecture: HIGH — Static export + SW injection is a known pattern; one open question on Expo 55 webpack
- Pitfalls: HIGH — iOS constraints are documented Apple/WebKit behavior, not speculation
- Animation: HIGH — Reanimated worklet patterns already in use in Phase 3

**Research date:** 2026-03-28
**Valid until:** 2026-09-28 (Workbox stable; iOS constraints unlikely to change in 6 months)
