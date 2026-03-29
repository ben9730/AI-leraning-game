# Phase 14: PWA + Web Polish - Research

**Researched:** 2026-03-29
**Domain:** PWA (vite-plugin-pwa / Workbox), Responsive Layout (Tailwind v4), SEO (react-helmet-async)
**Confidence:** HIGH

## Summary

This phase adds progressive web app capabilities, responsive desktop layout, and SEO meta tags to an existing Vite 6 + React 19 + Tailwind v4 SPA. The codebase is already well-structured for these additions — vite.config.ts is the single integration point for the PWA plugin, App.tsx contains the layout shell, and TabBar.tsx is the only component that needs responsive hiding.

The decisions from CONTEXT.md are specific and well-reasoned: vite-plugin-pwa 1.2.0 with Workbox generateSW mode, cache-first for lesson JSON content, network-first for app shell, react-helmet-async 3.0.0 for per-route titles, a single static 1200x630 OG image, and a 3-tier Tailwind breakpoint layout. The UI-SPEC.md provides the exact component inventory, color tokens, copy, and accessibility requirements — the planner can use it directly to scope tasks.

The key implementation risk is the vite-plugin-pwa `registerType` choice. The CONTEXT.md decision is "prompt user to reload when new version available" which maps to `registerType: 'prompt'` (not `autoUpdate`) combined with `useRegisterSW` hook from `virtual:pwa-register/react`. This pattern requires a custom UpdateToast component that calls `registration.waiting.postMessage({ type: 'SKIP_WAITING' })` — it does NOT use `autoUpdate` which silently reloads.

**Primary recommendation:** Install `vite-plugin-pwa` + `workbox-window` as devDependencies, `react-helmet-async` as a runtime dependency. Four new components (Sidebar, InstallBanner, OfflineBanner, UpdateToast) and one utility component (AppHead) are needed, plus modifications to App.tsx, TabBar.tsx, index.html, and vite.config.ts.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### PWA & Offline Strategy
- Use vite-plugin-pwa with Workbox for service worker generation and manifest
- Cache-first strategy for visited lesson JSONs (static, safe to cache aggressively); network-first for app shell (needs freshness for updates)
- Subtle top banner when offline: "You're offline — cached lessons still available"
- Prompt user to reload when new version available ("New version available, refresh?" toast)

#### Responsive Layout & Desktop Enhancement
- Breakpoints: 768px (md) for tablet, 1024px (lg) for desktop — standard Tailwind breakpoints, 3 tiers
- Desktop: max-w-2xl centered content area with sidebar on lg+ showing skill tree mini-map
- Convert bottom TabBar to left sidebar navigation on lg+ screens — standard web pattern
- Progressive enhancement: existing mobile-first components stay, add Tailwind responsive modifiers (md:, lg:)

#### SEO & Install Experience
- Single static OG image for the app (PromptPlay branding) — SPA can't generate per-page OG without SSR
- react-helmet-async for per-route `<title>` and `<meta description>` — lightweight, works with React Router
- Custom iOS install nudge banner on first visit (dismissible): "Add to Home Screen" with instructions
- Minimal icon set: 192px + 512px PNG for manifest.json + install banner

### Claude's Discretion
- Specific service worker caching rules and precache patterns
- manifest.json theme_color and background_color values
- Desktop sidebar mini-map visual design
- OG image design and dimensions
- Exact wording of offline/update/install banners (i18n keys)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PWA-01 | Service worker with Workbox for offline lesson access (previously visited lessons) | vite-plugin-pwa generateSW mode + CacheFirst for lesson JSON; NetworkFirst for app shell bundles |
| PWA-02 | Web manifest + install banner (Android auto-prompt, iOS in-app nudge) | beforeinstallprompt event for Android; custom nudge component with localStorage dismissal for iOS; manifest.json with 192+512 icons |
| PWA-03 | Responsive layout — mobile-first with desktop-enhanced sidebar/wider content | Tailwind md:/lg: modifiers; TabBar gets `lg:hidden`; new Sidebar component at lg+; ms-64 offset on main content |
| PWA-04 | SEO meta tags + Open Graph cards for lesson/page sharing | react-helmet-async 3.0.0 (React 19 transparent passthrough); static base OG tags in index.html; per-route title/description via AppHead component |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite-plugin-pwa | 1.2.0 | Service worker + manifest generation | Zero-config PWA for Vite; wraps Workbox; official Vite ecosystem; locked decision |
| workbox-window | 7.4.0 | Client-side SW lifecycle management | Required peer dep of vite-plugin-pwa; provides `useRegisterSW` virtual module |
| react-helmet-async | 3.0.0 | Per-route `<title>` and `<meta>` injection | React 19 native support (transparent passthrough in v19); locked decision |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vite-pwa/assets-generator | ^1.0.0 | Optional: generate icon PNGs from source SVG | Use if no icons exist yet; optional peer dep of vite-plugin-pwa |
| workbox-build | 7.4.0 | Workbox CLI/build tools | Pulled in automatically by vite-plugin-pwa; do not install separately |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| vite-plugin-pwa | Manual workbox-build + vite-plugin-manifest | vite-plugin-pwa provides both in one plugin; manual approach adds complexity for no benefit |
| react-helmet-async | React 19 native `<title>` in JSX | React 19 natively hoists `<title>/<meta>` but lacks deduplication across routes; react-helmet-async is cleaner for SPA route-level overrides |
| Static OG image | Dynamic OG via edge function | SPA has no SSR; dynamic OG requires infra not in scope; single static image is the correct trade-off |

**Installation:**
```bash
cd web && npm install --save-dev vite-plugin-pwa workbox-window
npm install react-helmet-async
```

**Version verification (confirmed 2026-03-29):**
- `vite-plugin-pwa`: 1.2.0 (latest) — peer deps: vite ^3–7, workbox-build ^7.4.0, workbox-window ^7.4.0
- `react-helmet-async`: 3.0.0 (latest) — React 19 support added in this version
- `workbox-window`: 7.4.0 (latest)

---

## Architecture Patterns

### Recommended Project Structure (new files in phase 14)

```
web/
├── public/
│   ├── manifest.json          # Generated OR static; vite-plugin-pwa can inline it
│   ├── og-image.png           # 1200x630px static OG image
│   └── icons/
│       ├── pwa-192x192.png
│       └── pwa-512x512.png
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx        # NEW: desktop nav (lg+), mirrors TabBar links
│   │   ├── InstallBanner.tsx  # NEW: Android beforeinstallprompt + iOS nudge
│   │   ├── OfflineBanner.tsx  # NEW: amber bar when navigator.onLine = false
│   │   ├── UpdateToast.tsx    # NEW: prompt-for-update toast via useRegisterSW
│   │   ├── AppHead.tsx        # NEW: react-helmet-async wrapper per route
│   │   └── TabBar.tsx         # MODIFIED: add lg:hidden
│   └── App.tsx                # MODIFIED: HelmetProvider, responsive layout shell
├── index.html                 # MODIFIED: base meta tags, manifest link, apple meta
└── vite.config.ts             # MODIFIED: add VitePWA() plugin
```

### Pattern 1: vite-plugin-pwa Configuration (generateSW mode)

**What:** VitePWA plugin in vite.config.ts generates the service worker automatically using Workbox. `registerType: 'prompt'` is used so the app can show a custom update toast before applying the new SW.

**When to use:** When you want custom update UX (not silent auto-reload). The `useRegisterSW` virtual hook from `virtual:pwa-register/react` gives you `needRefresh` state to drive the UpdateToast.

**Example:**
```typescript
// web/vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/pwa-192x192.png', 'icons/pwa-512x512.png', 'og-image.png'],
      manifest: {
        name: 'PromptPlay',
        short_name: 'PromptPlay',
        description: 'Learn AI prompting through gamified practice',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // App shell (HTML entry + hashed JS/CSS bundles) — network-first
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Lesson JSON content — cache-first (static, safe to cache)
            urlPattern: /\/src\/content\/lessons\/.+\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lesson-content',
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Vite hashed assets — stale-while-revalidate (hash guarantees freshness)
            urlPattern: /\.(js|css|woff2?)(\?.*)?$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 100 },
            },
          },
          {
            // Icons and images — cache-first, long TTL
            urlPattern: /\.(png|svg|ico|webp)(\?.*)?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-assets',
              expiration: { maxEntries: 30, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  // ...
})
```

### Pattern 2: UpdateToast using useRegisterSW

**What:** The `virtual:pwa-register/react` module (provided by vite-plugin-pwa) exports a `useRegisterSW` hook. When a new SW is waiting, `needRefresh` is true. The component posts `SKIP_WAITING` to the waiting SW, then reloads.

**When to use:** When `registerType: 'prompt'` is set. NEVER call `window.location.reload()` directly — call `updateServiceWorker(true)` from the hook.

**Example:**
```typescript
// web/src/components/UpdateToast.tsx
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'

export function UpdateToast() {
  const { t } = useTranslation()
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-16 start-1/2 -translate-x-1/2 z-50 bg-white border border-indigo-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3"
    >
      <span className="text-sm text-gray-800">{t('pwa.updateAvailable')}</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="px-3 py-1 bg-indigo-600 text-white text-sm font-bold rounded-md"
      >
        {t('pwa.updateRefresh')}
      </button>
      <button
        onClick={() => updateServiceWorker(false)}
        className="text-sm text-gray-500"
      >
        {t('pwa.updateLater')}
      </button>
    </div>
  )
}
```

### Pattern 3: Offline Banner (navigator.onLine + events)

**What:** Track online/offline state with `window` events. Display an amber banner below the GameHeader (top: 56px) when offline. The banner auto-hides when back online — no dismiss button needed.

**When to use:** For informational degraded-capability messaging. Use `role="status" aria-live="polite"` per WCAG so screen readers announce the change without interrupting.

**Example:**
```typescript
// web/src/components/OfflineBanner.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function OfflineBanner() {
  const { t } = useTranslation()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-14 inset-x-0 z-30 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm py-2 px-4 text-center"
    >
      {t('pwa.offlineBanner')}
    </div>
  )
}
```

### Pattern 4: Install Banner (Android + iOS)

**What:** Two distinct install flows in one component. Android: capture `beforeinstallprompt` event, show banner with native prompt on CTA. iOS: detect `navigator.userAgent` for iPhone/iPad + `standalone` mode check, show manual instructions. Both use localStorage to persist dismissal.

**When to use:** For PWA-02. The `beforeinstallprompt` event fires only once per session on Android Chrome/Edge. Must be captured in an early `useEffect` before user interaction.

**Example:**
```typescript
// web/src/components/InstallBanner.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const DISMISSED_KEY = 'promptplay_install_dismissed'

type InstallMode = 'android' | 'ios' | 'none'

export function InstallBanner() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<InstallMode>('none')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return
    // Already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (isIOS) {
      setMode('ios')
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setMode('android')
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setMode('none')
  }

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
    }
    dismiss()
  }

  if (mode === 'none') return null

  return (
    <nav
      role="complementary"
      aria-label={t('pwa.installButton')}
      className="fixed bottom-14 lg:bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 shadow-lg px-4 py-3 flex items-center justify-between gap-3"
    >
      <span className="text-sm text-gray-800">
        {mode === 'ios' ? t('pwa.iosInstallHint') : t('pwa.installButton')}
      </span>
      <div className="flex items-center gap-2">
        {mode === 'android' && (
          <button
            onClick={install}
            className="h-11 px-4 bg-indigo-600 text-white text-sm font-bold rounded-md"
          >
            {t('pwa.installButton')}
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label={t('pwa.dismiss')}
          className="h-11 px-3 text-sm text-gray-500"
        >
          {t('pwa.dismiss')}
        </button>
      </div>
    </nav>
  )
}
```

### Pattern 5: Responsive Layout Shell (App.tsx)

**What:** Wrap the `RootLayout` content area in a `flex flex-row` container. The `Sidebar` component renders at lg+, the main area gets `lg:ms-64` margin. The bottom `pb-14` padding on `<main>` should become `lg:pb-0` since there's no TabBar on desktop.

**When to use:** One structural change to App.tsx wraps all responsive behavior — no changes needed to individual page components.

**Example:**
```typescript
// web/src/App.tsx - RootLayout update
function RootLayout() {
  // ...existing store hooks...
  return (
    <HelmetProvider>
      <div className="flex min-h-dvh">
        {/* Desktop sidebar — hidden on mobile/tablet */}
        <Sidebar />
        {/* Main content area */}
        <div className="flex flex-col flex-1 lg:ms-64">
          <GameHeader />
          <OfflineBanner />
          <main className="flex-1 flex flex-col pb-14 lg:pb-0">
            <Outlet />
          </main>
          {/* Bottom TabBar — hidden on desktop */}
          <TabBar />
        </div>
        {/* Modals and banners */}
        <UpdateToast />
        <InstallBanner />
        {pendingLevelUp !== null && (
          <LevelUpModal level={pendingLevelUp} onDismiss={clearPendingLevelUp} />
        )}
      </div>
    </HelmetProvider>
  )
}
```

### Pattern 6: AppHead (react-helmet-async)

**What:** Thin wrapper component placed at top of each page component to set `<title>` and `<meta name="description">`. The `HelmetProvider` wraps the entire app in App.tsx.

**When to use:** On every route component (HomePage, SkillTreePage, ProfilePage, LessonPage, OnboardingPage).

**Example:**
```typescript
// web/src/components/AppHead.tsx
import { Helmet } from 'react-helmet-async'

interface AppHeadProps {
  title?: string
  description?: string
}

export function AppHead({ title, description }: AppHeadProps) {
  const fullTitle = title ? `${title} — PromptPlay` : 'PromptPlay — Learn AI Prompting'
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
    </Helmet>
  )
}
```

### Anti-Patterns to Avoid

- **`registerType: 'autoUpdate'` with a custom toast:** `autoUpdate` forces `skipWaiting` immediately — the toast never triggers. Use `registerType: 'prompt'` when you want user-controlled updates.
- **Calling `window.location.reload()` in UpdateToast:** Always use `updateServiceWorker(true)` from `useRegisterSW` — it handles the SW message and reload atomically.
- **Physical CSS in sidebar (left/right):** Use `inset-inline-start-0` / `start-0` and `ms-64` — the project RTL convention is CSS logical properties everywhere.
- **Missing `navigateFallback` in workbox config:** Without it, direct-URL navigation while offline (e.g., `/lesson/01`) returns a 404 instead of serving the app shell from cache.
- **Inline `manifest.json` in public/ without plugin config:** vite-plugin-pwa can generate manifest from the `manifest:` config block OR use a static file — don't do both. Use plugin config.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker generation | Custom SW with cache API calls | `vite-plugin-pwa` generateSW | Workbox handles precaching, versioning, cleanup of stale caches, and navigation fallback — these are all error-prone to implement manually |
| Update detection | Polling navigator.serviceWorker.controller | `useRegisterSW` from `virtual:pwa-register/react` | Built-in reactive state for `needRefresh` and `offlineReady`; handles SW lifecycle events correctly |
| iOS install detection | Custom UA parsing | Pattern from react-ios-pwa-prompt | iOS detection with `standalone` mode check prevents showing nudge to already-installed users |
| OG image generation | Canvas/Puppeteer | Static PNG in `public/` | SPA has no SSR; static image is architecturally correct for this stack |
| Per-route `<title>` | Direct `document.title = ...` in useEffect | `react-helmet-async` | Handles deduplication, SSR compatibility, og:title sync — useEffect approach misses first render |

**Key insight:** Service worker caching has many edge cases (navigation fallback, opaque responses, cache versioning, stale-while-revalidate for hashed assets). Workbox via vite-plugin-pwa handles all of them with battle-tested defaults.

---

## Common Pitfalls

### Pitfall 1: Service Worker Not Updating in Dev

**What goes wrong:** In development (`vite dev`), vite-plugin-pwa uses a mock service worker by default. Caching strategies don't apply, and the real SW is not registered.
**Why it happens:** The plugin uses `devOptions: { enabled: false }` by default to avoid dev cache interference.
**How to avoid:** Test PWA features with `vite build && vite preview`. Add `devOptions: { enabled: true }` only if you need to test SW behavior in dev (not recommended for normal work).
**Warning signs:** "SW not registered" in Chrome DevTools → Application tab during `vite dev`.

### Pitfall 2: `virtual:pwa-register/react` TypeScript Errors

**What goes wrong:** TypeScript can't find the `virtual:pwa-register/react` module.
**Why it happens:** The virtual module types aren't included automatically in tsconfig.
**How to avoid:** Add `/// <reference types="vite-plugin-pwa/client" />` to `src/vite-env.d.ts` (or create it if missing).
**Warning signs:** TS error "Cannot find module 'virtual:pwa-register/react'".

### Pitfall 3: iOS Install Nudge Shows When Already Installed

**What goes wrong:** The install banner appears even after the user has already installed the app.
**Why it happens:** `window.matchMedia('(display-mode: standalone)').matches` returns true when running as installed PWA — forgetting this check causes the nudge to show in the installed app.
**How to avoid:** Always check `display-mode: standalone` BEFORE showing iOS nudge. The InstallBanner pattern above includes this guard.
**Warning signs:** Banner visible when launched from home screen.

### Pitfall 4: Workbox Caching Lesson JSON in Dev Glob Paths

**What goes wrong:** The `urlPattern` for lesson JSON uses a regex matching `/src/content/lessons/` which works in dev but not in production (Vite rewrites asset paths).
**Why it happens:** In production build, lesson JSONs imported via `import.meta.glob` may be hashed or bundled differently.
**How to avoid:** Use a URL pattern that matches the final serving URL. With `eager: true` glob imports the JSON is bundled into JS chunks — the runtime caching pattern for JSON files applies to any future dynamic fetches, not the already-bundled content. Workbox's `navigateFallback` + precache of the JS bundles is sufficient for offline lesson access.
**Warning signs:** Cached lessons not loading offline despite service worker being active.

### Pitfall 5: react-helmet-async Not Deduplicating `og:title`

**What goes wrong:** Both `index.html` static `og:title` and AppHead's dynamic `og:title` render — some crawlers see duplicates.
**Why it happens:** Static meta tags in `index.html` are not managed by react-helmet-async.
**How to avoid:** Do NOT add `og:title` to `index.html` as a static tag. Put it in AppHead where it's managed by react-helmet-async. Only `og:image`, `og:type`, and `og:site_name` belong in index.html (they don't change per-route).
**Warning signs:** Facebook OG debugger shows duplicate og:title.

### Pitfall 6: Sidebar RTL Positioning

**What goes wrong:** Sidebar sits on the wrong side in Hebrew (RTL) mode.
**Why it happens:** Using `left-0` / `ml-64` instead of CSS logical properties.
**How to avoid:** Sidebar must use `start-0` (`inset-inline-start: 0`) and main content uses `ms-64` (`margin-inline-start: 1rem * 16`). The existing project convention (Tailwind `ps`/`pe`/`ms`/`me`) already establishes this.
**Warning signs:** Sidebar overlaps content when `document.dir = "rtl"`.

---

## Code Examples

### vite.config.ts Full Integration

```typescript
// Source: vite-pwa-org.netlify.app/guide/ + verified pattern
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/pwa-192x192.png', 'icons/pwa-512x512.png'],
      manifest: {
        name: 'PromptPlay',
        short_name: 'PromptPlay',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /\.(png|svg|ico|webp)(\?.*)?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-assets',
              expiration: { maxEntries: 30, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
})
```

### index.html Base Meta Tags

```html
<!-- Source: CONTEXT.md SEO decisions + UI-SPEC.md -->
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PromptPlay</title>
  <meta name="description" content="Learn AI prompting skills through gamified practice. Master prompts with Duolingo-style lessons." />
  <meta name="theme-color" content="#4f46e5" />
  <link rel="manifest" href="/manifest.json" />
  <!-- Open Graph (static, per-route og:title handled by react-helmet-async) -->
  <meta property="og:type" content="website" />
  <meta property="og:image" content="/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="PromptPlay" />
  <meta name="twitter:card" content="summary_large_image" />
  <!-- iOS PWA -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
</head>
```

### TypeScript Declaration for virtual module

```typescript
// web/src/vite-env.d.ts (add this line)
/// <reference types="vite-plugin-pwa/client" />
```

### Sidebar Component (lg+ only)

```typescript
// Source: UI-SPEC.md responsive layout contract
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'

const navItems = [
  { to: '/', labelKey: 'tabs.home', icon: '🏠', end: true },
  { to: '/tree', labelKey: 'tabs.skillTree', icon: '🌳', end: false },
  { to: '/profile', labelKey: 'tabs.profile', icon: '👤', end: false },
] as const

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <aside className="hidden lg:flex fixed inset-y-0 start-0 w-64 flex-col bg-gray-50 border-e border-gray-200 z-40">
      <div className="p-4 border-b border-gray-200">
        <span className="text-xl font-bold text-indigo-600">PromptPlay</span>
      </div>
      <nav aria-label="Main navigation" className="flex-1 py-4">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-4 py-3 text-sm border-s-2',
                isActive
                  ? 'border-indigo-600 text-indigo-600 font-bold bg-indigo-50'
                  : 'border-transparent opacity-60 hover:opacity-80',
              ].join(' ')
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
      {/* Skill tree mini-map placeholder */}
      <div className="p-4 border-t border-gray-200 max-h-48 overflow-y-auto">
        {/* Mini-map: read-only chapter overview — implementation detail */}
      </div>
    </aside>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `workbox-build` + webpack plugin | `vite-plugin-pwa` with Workbox | Vite era (~2021) | Single plugin handles manifest + SW; generateSW mode requires zero SW boilerplate |
| `react-helmet` (deprecated) | `react-helmet-async` | 2019 (async version) | Thread-safe, no memory leaks; v3.0.0 adds React 19 transparent mode |
| `registerType: 'autoUpdate'` | `registerType: 'prompt'` for user-controlled updates | Established pattern | Prevents data loss from silent reloads during active use |
| `left-0` / `ml-*` CSS | `start-0` / `ms-*` logical CSS | Phase 8 convention | RTL-safe by default; already project standard |

**Deprecated/outdated:**
- `react-helmet` (original): replaced by `react-helmet-async` — do not install `react-helmet`
- `workbox-webpack-plugin`: webpack-era, not relevant for Vite project

---

## Open Questions

1. **Lesson JSON caching path in production**
   - What we know: Lessons are loaded via `import.meta.glob` with `eager: true` — they're bundled into JS chunks at build time
   - What's unclear: Whether any runtime JSON fetches happen (that would benefit from runtimeCaching), or if all lesson data is already in the JS bundle (making the lesson CacheFirst rule a no-op)
   - Recommendation: During Wave 1, verify by checking the built `dist/` — if no `.json` files appear there, the runtimeCaching rule for JSON is unnecessary; the app shell precache alone suffices for offline

2. **Skill tree mini-map in sidebar**
   - What we know: UI-SPEC calls for a "scaled-down read-only chapter overview" in the sidebar bottom section
   - What's unclear: Whether this reuses the SkillTreePage component at reduced scale, or a simplified list, or a custom mini-visualization
   - Recommendation: Implement as a simple chapter list with completion dots (reuse store data, no animation) — the full SkillTree component is likely too heavy for sidebar context

3. **OG image creation**
   - What we know: Dimensions are 1200x630px, indigo-600 background, "PromptPlay" text, system-ui font
   - What's unclear: How this file will be created (Canvas script, design tool, manual)
   - Recommendation: Create a simple Node.js script using `canvas` npm package, or create manually in any image editor — this is a one-time asset, not code

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install, vite build | ✓ | (project already running) | — |
| vite-plugin-pwa | PWA-01, PWA-02 | ✗ (not yet installed) | 1.2.0 available | — (must install) |
| react-helmet-async | PWA-04 | ✗ (not yet installed) | 3.0.0 available | React 19 native `<title>` (degraded deduplication) |
| workbox-window | PWA-01 (peer dep) | ✗ (not yet installed) | 7.4.0 available | — (required by vite-plugin-pwa) |

**Missing dependencies with no fallback:**
- `vite-plugin-pwa` and `workbox-window` — required for PWA-01 and PWA-02; must be installed in Wave 0

**Missing dependencies with fallback:**
- `react-helmet-async` — React 19 natively hoists `<title>` elements; if package install fails, per-route titles can use `document.title` in useEffect as a degraded fallback (loses og:title sync)

---

## Sources

### Primary (HIGH confidence)
- https://vite-pwa-org.netlify.app/guide/ — vite-plugin-pwa official docs (guide, workbox config)
- https://vite-pwa-org.netlify.app/workbox/generate-sw — generateSW mode runtimeCaching options
- https://vite-pwa-org.netlify.app/guide/prompt-for-update — useRegisterSW + registerType:'prompt' pattern
- https://github.com/staylor/react-helmet-async/pull/260 — React 19 support in v3.0.0
- npm registry — verified package versions (2026-03-29): vite-plugin-pwa@1.2.0, react-helmet-async@3.0.0, workbox-window@7.4.0

### Secondary (MEDIUM confidence)
- https://web.dev/learn/pwa/installation-prompt — beforeinstallprompt event lifecycle and iOS limitations
- https://web.dev/learn/pwa/web-app-manifest — manifest.json best practices (maskable icons, 192+512 minimum)
- https://tailwindcss.com/docs/responsive-design — Tailwind v4 breakpoint system (md:768px, lg:1024px)
- UI-SPEC.md (14-UI-SPEC.md in this repo) — complete component inventory, color tokens, layout contract, accessibility requirements

### Tertiary (LOW confidence)
- GitHub issue discussions on vite-plugin-pwa/issues/743 — autoUpdate vs prompt behavior nuances
- Medium articles on iOS PWA detection patterns (multiple sources, consistent approach)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package versions verified against npm registry; vite-plugin-pwa peer deps confirmed
- Architecture: HIGH — pattern derived from official vite-plugin-pwa docs + established project conventions (Tailwind v4, React Router 7, logical CSS properties)
- Pitfalls: HIGH — SW dev/prod difference and virtual module TS types are documented in official sources; RTL pitfall is directly verified from project convention

**Research date:** 2026-03-29
**Valid until:** 2026-04-29 (stable ecosystem; vite-plugin-pwa versions move slowly)
