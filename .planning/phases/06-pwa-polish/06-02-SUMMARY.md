---
phase: 06-pwa-polish
plan: 02
subsystem: pwa
tags: [pwa, manifest, install-banner, ios, android, i18n, rtl]
dependency_graph:
  requires: [06-01]
  provides: [web-manifest, pwa-icons, install-banner, cache-budget-script]
  affects: [app/(tabs)/_layout.tsx, i18n/en/common.json, i18n/he/common.json]
tech_stack:
  added: []
  patterns: [beforeinstallprompt-capture, localStorage-dismiss-persist, ios-standalone-detection]
key_files:
  created:
    - PromptPlay/web/manifest.json
    - PromptPlay/web/index.html
    - PromptPlay/assets/icons/icon-192.png
    - PromptPlay/assets/icons/icon-512.png
    - PromptPlay/assets/icons/icon-512-maskable.png
    - PromptPlay/src/features/pwa/useInstallPrompt.ts
    - PromptPlay/src/features/pwa/InstallBanner.tsx
    - PromptPlay/src/features/pwa/__tests__/manifest.test.ts
    - PromptPlay/src/features/pwa/__tests__/InstallBanner.test.tsx
  modified:
    - PromptPlay/app/(tabs)/_layout.tsx
    - PromptPlay/src/i18n/en/common.json
    - PromptPlay/src/i18n/he/common.json
    - PromptPlay/package.json
decisions:
  - InstallBanner uses full react-native mock (no requireActual) in jsdom jest project — RN ESM cannot be loaded by ts-jest without babel transform
  - Placeholder PNG icons generated via Node.js zlib/deflate (solid indigo #4F46E5, 192x192 and 512x512) — no sharp dependency needed for v1
  - web/index.html created as Expo Metro static output HTML override — copies Expo CLI template and adds PWA/iOS meta tags
  - responsive-layout.test.ts pre-existing failures deferred — those files belong to a later plan
metrics:
  duration: 25min
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_created: 9
  files_modified: 4
---

# Phase 06 Plan 02: PWA Installability Summary

**One-liner:** Web app manifest with standalone display + maskable icons, dual iOS/Android InstallBanner with localStorage dismiss persistence, and cache budget validation script.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Web app manifest + PWA icons + HTML head link | f852f54 | web/manifest.json, web/index.html, assets/icons/*.png, manifest.test.ts |
| 2 | InstallBanner + useInstallPrompt + cache budget | 4b63994 | InstallBanner.tsx, useInstallPrompt.ts, InstallBanner.test.tsx, _layout.tsx, package.json |

## What Was Built

### Task 1: Web App Manifest + Icons + HTML Template

- `web/manifest.json` — full Chrome installability manifest: `display: standalone`, `dir: auto` (RTL), `theme_color: #4F46E5`, maskable icon entry, 192px + 512px icons
- `assets/icons/` — three valid PNG files (192x192, 512x512, 512x512-maskable) generated as solid indigo placeholders via Node.js zlib — no extra dependency
- `web/index.html` — Expo Metro static output HTML template override with `<link rel="manifest">`, `<meta name="theme-color">`, and iOS meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`)
- 6 manifest validation tests all pass (valid JSON, required fields, standalone display, 192/512 icons, maskable icon, dir=auto)

### Task 2: InstallBanner + useInstallPrompt + Cache Budget

- `useInstallPrompt.ts` — captures `beforeinstallprompt` event on web, defers it, exposes `{ canInstall, triggerInstall }`. Non-web platforms return no-op stub.
- `InstallBanner.tsx` — dismissible banner with dual logic:
  - iOS Safari (userAgent match, not standalone): shows instructional hint text
  - Android Chrome (canInstall=true from beforeinstallprompt): shows install button
  - Already in standalone mode: renders nothing
  - After dismiss: renders nothing; dismiss persisted to localStorage so banner stays hidden on reload
  - RTL-safe styles: `paddingStart/End`, `marginEnd` throughout
  - All strings translatable via `t('pwa.*')` keys
- i18n keys added to both `en/common.json` and `he/common.json`: `pwa.installButton`, `pwa.iosInstallHint`, `pwa.dismiss`
- `app/(tabs)/_layout.tsx` — `<InstallBanner />` rendered above `<Tabs>` inside a flex `<View>` wrapper
- `package.json` — `check:cache-budget` script: runs `expo export --platform web` then cross-platform Node.js recursive dir size check against 35MB limit, exits 1 if over budget
- 5 InstallBanner tests all pass

## Test Results

```
manifest.test.ts:      6 passed
InstallBanner.test.tsx: 5 passed
Total:                 11 passed
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Jest 30 flag rename**
- **Found during:** Task 1 verification
- **Issue:** Plan used `--testPathPattern` but Jest 30 renamed it to `--testPathPatterns`
- **Fix:** Used `--testPathPatterns` in all test runs
- **Files modified:** none (CLI flag only)
- **Commit:** n/a

**2. [Rule 1 - Bug] react-native requireActual fails in jsdom ts-jest project**
- **Found during:** Task 2 verification
- **Issue:** `jest.requireActual('react-native')` in jsdom project triggers ESM import error — react-native ships ESM that ts-jest cannot load without babel transform in this project
- **Fix:** Replaced with a complete manual mock (Platform, StyleSheet, View, Text, Pressable) that renders HTML elements — no requireActual needed
- **Files modified:** `src/features/pwa/__tests__/InstallBanner.test.tsx`
- **Commit:** 4b63994

### Out-of-scope Discoveries

- `responsive-layout.test.ts` (6 failures) — pre-existing test suite from 06-01 that checks files not yet created. Logged to `deferred-items.md`. Not fixed — belongs to a later plan.

## Self-Check: PASSED

All files exist. Both commits verified (f852f54, 4b63994).
