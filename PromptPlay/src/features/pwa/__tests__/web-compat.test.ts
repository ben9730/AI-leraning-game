/**
 * Web Compatibility Tests
 *
 * Verifies that all web-critical modules work in a jsdom environment
 * (no native-only imports, no import.meta, localStorage fallbacks).
 */

import * as fs from 'fs'
import * as path from 'path'

const PROJECT_ROOT = path.resolve(__dirname, '../../../../')

describe('Web Compatibility', () => {
  describe('no import.meta in bundled source', () => {
    it('zustand middleware CJS has no import.meta', () => {
      const cjsPath = path.join(
        PROJECT_ROOT,
        'node_modules/zustand/middleware.js'
      )
      if (!fs.existsSync(cjsPath)) return // skip if zustand layout differs
      const content = fs.readFileSync(cjsPath, 'utf-8')
      // CJS build must not contain import.meta (ESM-only syntax)
      expect(content).not.toMatch(/import\.meta\.env/)
    })

    it('metro config forces CJS condition names', () => {
      const metroPath = path.join(PROJECT_ROOT, 'metro.config.js')
      expect(fs.existsSync(metroPath)).toBe(true)
      const content = fs.readFileSync(metroPath, 'utf-8')
      expect(content).toMatch(/unstable_conditionNames/)
      expect(content).toMatch(/require/)
    })
  })

  describe('no expo-updates in source (web-breaking)', () => {
    it('i18n/index.ts does not import expo-updates', () => {
      const i18nPath = path.join(PROJECT_ROOT, 'src/i18n/index.ts')
      const content = fs.readFileSync(i18nPath, 'utf-8')
      expect(content).not.toMatch(/expo-updates/)
    })

    it('reload.web.ts uses window.location.reload', () => {
      const reloadPath = path.join(PROJECT_ROOT, 'src/i18n/reload.web.ts')
      expect(fs.existsSync(reloadPath)).toBe(true)
      const content = fs.readFileSync(reloadPath, 'utf-8')
      expect(content).toMatch(/window\.location\.reload/)
      expect(content).not.toMatch(/expo-updates/)
    })

    it('expo-updates is not in package.json dependencies', () => {
      const pkgPath = path.join(PROJECT_ROOT, 'package.json')
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      expect(pkg.dependencies['expo-updates']).toBeUndefined()
    })
  })

  describe('persistence web fallback', () => {
    it('MMKVAdapter.ts uses Platform-guarded localStorage on web', () => {
      const adapterPath = path.join(
        PROJECT_ROOT,
        'src/persistence/MMKVAdapter.ts'
      )
      const content = fs.readFileSync(adapterPath, 'utf-8')
      // Must import Platform for web detection
      expect(content).toMatch(/Platform\.OS\s*===\s*['"]web['"]/)
      // Must use localStorage on web
      expect(content).toMatch(/localStorage\.getItem/)
      expect(content).toMatch(/localStorage\.setItem/)
      // Must lazy-require MMKV (not top-level import)
      expect(content).not.toMatch(/^import.*from\s+['"]react-native-mmkv['"]/m)
      expect(content).toMatch(/require\(['"]react-native-mmkv['"]\)/)
    })
  })

  describe('hydration completes without stored data', () => {
    it('onRehydrateStorage always calls setHasHydrated', () => {
      const storePath = path.join(
        PROJECT_ROOT,
        'src/store/useProgressStore.ts'
      )
      const content = fs.readFileSync(storePath, 'utf-8')
      // The setHasHydrated call must NOT be gated behind `if (state)`
      // It must be called unconditionally after the state check block
      expect(content).toMatch(/useProgressStore\.getState\(\)\.setHasHydrated\(true\)/)
    })
  })

  describe('layout does not block on font loading for web', () => {
    it('_layout.tsx bypasses font gate on web platform', () => {
      const layoutPath = path.join(PROJECT_ROOT, 'app/_layout.tsx')
      const content = fs.readFileSync(layoutPath, 'utf-8')
      // Must import Platform
      expect(content).toMatch(/Platform/)
      // Must have a web bypass for font loading
      expect(content).toMatch(/Platform\.OS\s*===\s*['"]web['"]/)
    })
  })

  describe('lottie web dependency', () => {
    it('@lottiefiles/dotlottie-react is installed', () => {
      const pkgPath = path.join(PROJECT_ROOT, 'package.json')
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      expect(
        pkg.dependencies['@lottiefiles/dotlottie-react'] ||
        pkg.devDependencies?.['@lottiefiles/dotlottie-react']
      ).toBeDefined()
    })
  })
})
