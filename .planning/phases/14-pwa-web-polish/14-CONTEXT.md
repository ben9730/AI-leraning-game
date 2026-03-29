# Phase 14: PWA + Web Polish - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver PWA installability with offline lesson caching, responsive layout from 320px to 1440px+ with desktop sidebar navigation, and SEO meta tags with Open Graph cards for sharing.

</domain>

<decisions>
## Implementation Decisions

### PWA & Offline Strategy
- Use vite-plugin-pwa with Workbox for service worker generation and manifest
- Cache-first strategy for visited lesson JSONs (static, safe to cache aggressively); network-first for app shell (needs freshness for updates)
- Subtle top banner when offline: "You're offline — cached lessons still available"
- Prompt user to reload when new version available ("New version available, refresh?" toast)

### Responsive Layout & Desktop Enhancement
- Breakpoints: 768px (md) for tablet, 1024px (lg) for desktop — standard Tailwind breakpoints, 3 tiers
- Desktop: max-w-2xl centered content area with sidebar on lg+ showing skill tree mini-map
- Convert bottom TabBar to left sidebar navigation on lg+ screens — standard web pattern
- Progressive enhancement: existing mobile-first components stay, add Tailwind responsive modifiers (md:, lg:)

### SEO & Install Experience
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `web/src/components/TabBar.tsx` — Bottom tab bar, needs responsive conversion to sidebar on lg+
- `web/src/components/GameHeader.tsx` — Top bar, stays on all viewports
- `web/src/App.tsx` — Router with RootLayout, integration point for responsive layout
- `web/vite.config.ts` — Add vite-plugin-pwa here
- `web/index.html` — Add meta tags, manifest link, theme-color

### Established Patterns
- Tailwind v4 with CSS logical properties (ps/pe/ms/me)
- React Router 7 with createBrowserRouter
- i18next for translations
- Zustand with localStorage persistence

### Integration Points
- `web/vite.config.ts` — Add VitePWA plugin
- `web/index.html` — Meta tags, manifest link, OG tags
- `web/public/` — manifest.json, icons, OG image
- `web/src/App.tsx` — Responsive layout wrapper, install prompt logic
- `web/src/components/TabBar.tsx` — Desktop sidebar conversion

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches based on established patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
