---
phase: 14-pwa-web-polish
plan: "02"
subsystem: pwa-ui
tags: [pwa, responsive, sidebar, helmet, offline, install-prompt, i18n]
dependency_graph:
  requires: [pwa-service-worker, pwa-manifest, pwa-i18n-keys]
  provides: [responsive-layout, desktop-sidebar, offline-banner, update-toast, install-banner, per-route-titles]
  affects: [web/src/App.tsx, web/src/components/TabBar.tsx, web/src/pages/*]
tech_stack:
  added: [react-helmet-async (HelmetProvider + Helmet)]
  patterns: [responsive-sidebar-at-lg, lg:hidden-tabbar, useRegisterSW-update-toast, beforeinstallprompt-android, ios-ua-detection, per-route-helmet-titles]
key_files:
  created:
    - web/src/components/Sidebar.tsx
    - web/src/components/OfflineBanner.tsx
    - web/src/components/UpdateToast.tsx
    - web/src/components/InstallBanner.tsx
    - web/src/components/AppHead.tsx
  modified:
    - web/src/App.tsx
    - web/src/components/TabBar.tsx
    - web/src/pages/HomePage.tsx
    - web/src/pages/SkillTreePage.tsx
    - web/src/pages/ProfilePage.tsx
    - web/src/pages/LessonPage.tsx
    - web/src/pages/OnboardingPage.tsx
decisions:
  - "Sidebar uses CSS logical properties (start-0, border-e, border-s-2) for RTL safety throughout"
  - "AppHead placed as first element in each page's JSX return — title updates on every route change"
  - "UpdateToast uses updateServiceWorker(true) for reload — never window.location.reload() directly"
  - "InstallBanner uses localStorage key promptplay_install_dismissed to persist dismiss across sessions"
  - "LessonPage AppHead placed in intro phase only — title set from lesson.content.title[lang]"
metrics:
  duration: 18min
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_modified: 12
---

# Phase 14 Plan 02: PWA UI Components and Responsive Layout Summary

Desktop sidebar nav with skill tree mini-map, responsive layout shell (lg:ms-64 + lg:max-w-2xl centered), PWA banners (offline/update/install), and per-route page titles via react-helmet-async across all 5 pages.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create PWA UI components — Sidebar, OfflineBanner, UpdateToast, InstallBanner, AppHead | 651e7d6 | web/src/components/Sidebar.tsx, OfflineBanner.tsx, UpdateToast.tsx, InstallBanner.tsx, AppHead.tsx |
| 2 | Wire responsive layout shell and add per-route AppHead to all pages | c4e7656 | web/src/App.tsx, TabBar.tsx, HomePage.tsx, SkillTreePage.tsx, ProfilePage.tsx, LessonPage.tsx, OnboardingPage.tsx |

## Verification Results

- `npx tsc --noEmit` passed with no errors after both tasks
- `npx vite build` completed successfully in 2.96s
- `dist/sw.js` and `dist/workbox-efa7a47b.js` generated (PWA service worker)
- `dist/manifest.webmanifest` present (0.42 kB)
- 8 entries precached (587.11 KiB)
- All 5 components created with correct exports, accessibility roles, and CSS logical properties
- TabBar has `lg:hidden`, Sidebar has `hidden lg:flex`
- App.tsx has `HelmetProvider`, `<Sidebar />`, `<OfflineBanner />`, `<UpdateToast />`, `<InstallBanner />`
- App.tsx main: `w-full lg:max-w-2xl lg:mx-auto lg:pb-0`
- All 5 pages have `AppHead` with appropriate titles

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] UpdateToast used non-existent i18n key `pwa.updateNow`**
- **Found during:** Task 1 creation
- **Issue:** Plan spec said to use a button for "Refresh" but used key `pwa.updateNow` which doesn't exist in common.json. The actual key is `pwa.updateRefresh`.
- **Fix:** Changed `t('pwa.updateNow')` to `t('pwa.updateRefresh')` to match the i18n file
- **Files modified:** web/src/components/UpdateToast.tsx
- **Commit:** 651e7d6

None other — plan executed as specified.

## Known Stubs

None — all components are fully wired with real data sources. The skill tree mini-map in Sidebar reads live `completedLessons` from the progress store and renders actual chapter titles from `chapters`. No placeholder data.

## Self-Check: PASSED

- web/src/components/Sidebar.tsx: exists, exports Sidebar, contains `hidden lg:flex`, `start-0`, `border-e`, `aria-label="Main navigation"`, `bg-green-500`, `bg-gray-300`, `completedLessons`
- web/src/components/OfflineBanner.tsx: exists, exports OfflineBanner, contains `role="status"`, `aria-live="polite"`, `navigator.onLine`
- web/src/components/UpdateToast.tsx: exists, exports UpdateToast, contains `useRegisterSW`, `updateServiceWorker(true)`, `role="alert"`, no `window.location.reload`
- web/src/components/InstallBanner.tsx: exists, exports InstallBanner, contains `beforeinstallprompt`, `promptplay_install_dismissed`, `display-mode: standalone`, `role="complementary"`, `h-11`
- web/src/components/AppHead.tsx: exists, exports AppHead, contains `Helmet` from `react-helmet-async`, `og:title`
- web/src/App.tsx: contains `HelmetProvider`, `<Sidebar />`, `<OfflineBanner />`, `<UpdateToast />`, `<InstallBanner />`, `lg:ms-64`, `lg:max-w-2xl`, `lg:mx-auto`, `lg:pb-0`, `flex min-h-dvh`
- web/src/components/TabBar.tsx: contains `lg:hidden`
- All 5 pages: contain AppHead
- Commits 651e7d6 and c4e7656: verified in git log
