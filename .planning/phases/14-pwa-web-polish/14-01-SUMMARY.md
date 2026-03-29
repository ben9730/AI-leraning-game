---
phase: 14-pwa-web-polish
plan: "01"
subsystem: pwa-infrastructure
tags: [pwa, vite, workbox, seo, i18n, icons]
dependency_graph:
  requires: []
  provides: [pwa-service-worker, pwa-manifest, seo-meta, og-image, pwa-icons, pwa-i18n-keys]
  affects: [web/vite.config.ts, web/index.html, shared/src/i18n]
tech_stack:
  added: [vite-plugin-pwa, workbox-window, react-helmet-async]
  patterns: [registerType-prompt, workbox-runtimeCaching, navigateFallback-index-html]
key_files:
  created:
    - web/public/icons/pwa-192x192.png
    - web/public/icons/pwa-512x512.png
    - web/public/og-image.png
  modified:
    - web/vite.config.ts
    - web/src/vite-env.d.ts
    - web/index.html
    - shared/src/i18n/en/common.json
    - shared/src/i18n/he/common.json
    - .gitignore
decisions:
  - "registerType: prompt chosen over autoUpdate — user-consent update toast in Plan 02 requires manual control"
  - "navigateFallback: index.html enables offline SPA navigation without per-route cache entries"
  - "Lesson JSON bundled via import.meta.glob eager:true — no separate JSON runtimeCaching needed (app shell covers it)"
  - "Placeholder solid-color PNGs for icons/OG image — functional for PWA registration, visual polish deferred"
  - ".gitignore negation rules added for web/public PNG assets to allow tracking alongside global *.png ignore"
metrics:
  duration: 12min
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_modified: 9
---

# Phase 14 Plan 01: PWA Infrastructure Setup Summary

vite-plugin-pwa with Workbox service worker, registerType prompt, SEO/OG meta tags, PWA icons, and pwa.* i18n keys for both EN and HE locales.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Install PWA deps + configure vite-plugin-pwa | c8a0b46 | web/vite.config.ts, web/src/vite-env.d.ts, web/package.json |
| 2 | SEO meta, icons, OG image, i18n keys | 2c5d451 | web/index.html, public/icons/*, public/og-image.png, shared/i18n |

## Verification Results

- `npx vite build` completed successfully
- `dist/sw.js` generated (Workbox service worker)
- `dist/registerSW.js` generated
- `dist/manifest.webmanifest` generated (0.42 kB)
- 8 entries precached (556.60 KiB)
- All pwa.* i18n keys present in EN (7 keys) and HE (7 keys)
- PWA icons at 192x192 and 512x512 exist as valid PNGs
- OG image at 1200x630 exists as valid PNG

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] .gitignore blocked PWA asset tracking**
- **Found during:** Task 2 commit
- **Issue:** Root `.gitignore` contained `*.png` blanket rule, blocking `git add` for pwa-192x192.png, pwa-512x512.png, og-image.png
- **Fix:** Added negation rules `!web/public/icons/*.png` and `!web/public/og-image.png` to root `.gitignore`
- **Files modified:** `.gitignore`
- **Commit:** 2c5d451

## Known Stubs

- `web/public/icons/pwa-192x192.png` — solid indigo (#4f46e5) placeholder, no "PP" text. Functional for PWA install prompt; visual polish deferred to a post-MVP design pass.
- `web/public/icons/pwa-512x512.png` — same as above at 512x512.
- `web/public/og-image.png` — solid indigo placeholder at 1200x630. Social sharing will show a color block rather than branded image. Deferred to post-MVP.

These stubs do not prevent the plan's goal (PWA infrastructure) from being achieved. Plan 02 builds UI components on top of this working plumbing.

## Self-Check: PASSED

- web/vite.config.ts: contains VitePWA, registerType prompt, navigateFallback, theme_color #4f46e5
- web/src/vite-env.d.ts: contains vite-plugin-pwa/client reference
- web/index.html: contains og:image, apple-mobile-web-app-capable, theme-color, manifest.webmanifest link
- web/public/icons/pwa-192x192.png: exists (547 bytes)
- web/public/icons/pwa-512x512.png: exists (1881 bytes)
- web/public/og-image.png: exists (3633 bytes)
- shared/src/i18n/en/common.json pwa.offlineBanner: "You're offline — cached lessons still available"
- shared/src/i18n/he/common.json pwa.offlineBanner: "אתה במצב לא מקוון — שיעורים שמורים עדיין זמינים"
- Commits c8a0b46 and 2c5d451: verified in git log
