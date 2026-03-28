# Technology Stack: Web-First PWA Rebuild

**Project:** PromptPlay Web
**Researched:** 2026-03-28
**Confidence:** HIGH

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vite | 6.x | Build tool + dev server | Fastest DX for React SPAs. Sub-second HMR. Native ESM. `import.meta.glob` for content loading. vite-plugin-pwa for service worker. No SSR overhead for a client-only app. |
| React | 19.x | UI library | Team already knows React (from RN). Hooks, Suspense, and concurrent features are production-ready. Largest ecosystem for web UI components. |
| TypeScript | 5.x | Language | Already used in PromptPlay. Type safety across shared code, store, and exercise evaluators is critical. |
| React Router | 7.x | Client-side routing | Standard React routing. Supports declarative routes, dynamic params (`/lesson/:id`), layout routes, and navigation guards. |

**Why Vite over Next.js:** PromptPlay is a client-only app with bundled JSON content. It has no SEO requirement, no server-side data fetching, and no API routes. Next.js adds SSR/SSG complexity with zero benefit. Vite is lighter, faster to develop with, and produces a simple static build deployable anywhere.

**Why not Remix/React Router Framework Mode:** Framework mode adds server-side loaders/actions. PromptPlay has no server -- all data is local (localStorage + bundled JSON). SPA mode with React Router library is the right fit.

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first CSS | Rapid UI development. Built-in logical property utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`) for RTL. Design tokens via CSS custom properties. Tree-shakes unused styles. v4 has CSS-first config. |
| CSS custom properties | - | Design tokens | Colors, spacing, border-radius defined once, consumed by Tailwind and any custom CSS. Source of truth for the design system. |

**Why not CSS Modules:** CSS Modules are fine for scoping but slower to iterate. Tailwind's utility classes match the rapid development pace needed for rebuilding 6 exercise components + multiple pages. The existing RN `StyleSheet.create` patterns map naturally to Tailwind classes.

**Why not CSS-in-JS (styled-components, Emotion):** Runtime CSS-in-JS adds bundle weight and hydration cost. Tailwind is zero-runtime.

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | 5.x | Global state (XP, streaks, progress, language) | Already used in PromptPlay. Same store shape, same actions, same persist middleware. Zero migration friction. 2KB bundle. |
| Zustand persist middleware | - | localStorage persistence | Built-in. `createJSONStorage(() => localStorage)` replaces the MMKV adapter. Simpler than the existing RN version. |

**Why not Redux Toolkit:** Zustand is already the choice. Switching to RTK adds boilerplate (slices, dispatch, selectors) with no benefit at this scale.

**Why not Jotai/Recoil:** Atomic state is better for deeply nested component trees. PromptPlay's state is flat and small (one store). Zustand is simpler.

### Content & Data

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Bundled JSON | - | Lesson content (20 lessons) | Already authored. Zero API cost. Fully offline. Vite bundles JSON natively via `import.meta.glob`. |
| Supabase | Cloud | Auth + cloud progress sync | Already configured for PromptPlay. Same project, same schema, same RLS policies. Web uses `@supabase/supabase-js` directly. |

### Animations

| Technology | Purpose | Why |
|------------|---------|-----|
| CSS animations + transitions | Micro-interactions (button presses, score reveals, progress bars) | Native browser capability. No library needed. `transition` and `@keyframes` cover 90% of gamification UI. |
| Framer Motion (optional) | Complex celebrations (level-up, lesson complete) | If CSS animations are insufficient for celebration screens. 15KB gzipped. Declarative API. Consider only if needed. |

**Why not Reanimated:** Reanimated is RN-only (uses native UI thread). Not available on web.

**Why not Lottie-web:** The existing Lottie animations (.json files in assets/lottie/) can be used via `lottie-web` or `@lottiefiles/lottie-player`. However, CSS animations are lighter and sufficient for v1. Add Lottie-web only if the existing celebration animations must be preserved pixel-perfectly.

### i18n / RTL

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| i18next | 24.x | Translation framework | Already used. Same translation files, same `t('key')` API. `react-i18next` provides `useTranslation` hook. |
| CSS logical properties | - | RTL layout | Web-native RTL. `margin-inline-start`, `padding-inline-end`, `text-align: start`. Replaces RN's `paddingStart/End`. Tailwind v4 supports these natively. |
| `document.dir` | - | RTL direction | Set `dir="rtl"` on `<html>` element. Replaces `I18nManager.forceRTL()`. No app reload needed (unlike RN). |

**Key improvement over RN:** On web, switching RTL does NOT require an app reload. Setting `document.dir` instantly flips all CSS logical properties. This is a better UX than the RN approach.

### PWA

| Technology | Purpose | Why |
|------------|---------|-----|
| vite-plugin-pwa | Service worker generation + manifest | Zero-config PWA plugin for Vite. Generates service worker with Workbox. Handles precaching, runtime caching, and update flow. Official Vite ecosystem. |
| Web App Manifest | Install metadata | Already have `manifest.json` from the existing `web/` directory. |
| Service Worker (Workbox) | Offline caching | CacheFirst for app shell + lesson JSON. StaleWhileRevalidate for images. Same strategy as existing `service-worker.js`. |

### Testing

| Technology | Purpose | Why |
|------------|---------|-----|
| Vitest | Unit + integration tests | Vite-native test runner. Same config as build. Fast. Compatible with existing test patterns (pure function tests for evaluators, engine). |
| Testing Library (React) | Component tests | Standard for React component testing. Tests exercise cards, lesson flow, store interactions. |
| Playwright | E2E tests | Already have `.playwright-mcp/` in the project. Browser-based E2E for full lesson flows. |

### Infrastructure

| Technology | Purpose | Why |
|------------|---------|-----|
| Vercel or Netlify | Static hosting | `vite build` produces static files. Deploy anywhere. Vercel has zero-config Vite support. |
| GitHub Actions | CI/CD | Lint + test + build + deploy on push. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Build tool | Vite | Next.js | No SSR/SSG needed. App is client-only with bundled content. Next.js adds complexity for zero benefit. |
| Build tool | Vite | Create React App | Deprecated. Vite is the React team's recommended alternative. |
| Styling | Tailwind v4 | CSS Modules | Slower iteration. Tailwind's logical property utilities are ideal for RTL. |
| Styling | Tailwind v4 | styled-components | Runtime CSS-in-JS. Bundle weight. Hydration cost. No benefit over Tailwind. |
| State | Zustand | Redux Toolkit | Already using Zustand. RTK adds ceremony. Same store shape ports directly. |
| State | Zustand | Jotai | Atomic state model is overkill for one flat store. |
| Router | React Router 7 | TanStack Router | React Router is more mature and the existing route structure maps directly. |
| Animations | CSS + optional Framer Motion | Lottie-web | CSS covers 90% of needs. Lottie-web is 50KB+ for animations that can be CSS. |
| i18n | i18next | next-intl | next-intl is Next.js-specific. i18next already in use. |
| Testing | Vitest | Jest | Vitest is Vite-native. Jest needs separate config. |

---

## Installation

```bash
# Create project
npm create vite@latest web -- --template react-ts
cd web

# Core dependencies
npm install react-router zustand @supabase/supabase-js i18next react-i18next

# Styling
npm install -D tailwindcss @tailwindcss/vite

# PWA
npm install -D vite-plugin-pwa

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Note:** No `expo`, `react-native`, `react-native-mmkv`, `expo-haptics`, `expo-localization`, `react-native-reanimated`, or `lottie-react-native` in the web project. These are all RN-only.

---

## Vite Configuration

```typescript
// web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PromptPlay',
        short_name: 'PromptPlay',
        theme_color: '#6C63FF',
        icons: [/* icon config */],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
})
```

---

## TypeScript Configuration

```jsonc
// web/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/src/*"]
    }
  },
  "include": ["src", "../shared/src"]
}
```

---

## Sources

- [Vite vs Next.js 2025](https://strapi.io/blog/vite-vs-nextjs-2025-developer-framework-comparison) -- MEDIUM confidence
- [Tailwind CSS v4 docs](https://tailwindcss.com/) -- HIGH confidence
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) -- HIGH confidence
- [Zustand persist middleware](https://zustand.docs.pmnd.rs/reference/middlewares/persist) -- HIGH confidence
- [React Router v7](https://reactrouter.com/) -- HIGH confidence
- [Tailwind CSS vs CSS Modules 2025](https://medium.com/@salmanmuhammed827/tailwind-css-vs-css-modules-in-2025-which-should-you-choose-7edfe9a75254) -- MEDIUM confidence
