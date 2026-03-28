/**
 * Animation Performance Audit — Static Analysis Guard
 *
 * Purpose: Prevent layout-property animations that cause layout recalculation
 * every frame on the UI thread, degrading performance on low-end Android devices.
 *
 * Rule: Inside useAnimatedStyle, ONLY use transform and opacity.
 * NEVER: width, height, top, left, right, bottom, margin*, padding*
 */

import * as fs from 'fs'
import * as path from 'path'

const CELEBRATIONS_DIR = path.resolve(
  __dirname,
  '../../gamification/celebrations'
)

const FILES_TO_AUDIT = [
  path.join(CELEBRATIONS_DIR, 'LessonCelebration.tsx'),
  path.join(CELEBRATIONS_DIR, 'LevelUpModal.tsx'),
]

// Forbidden layout properties inside useAnimatedStyle callbacks
const LAYOUT_PROPERTY_PATTERN =
  /\b(width|height|top|left|right|bottom|marginTop|marginBottom|marginLeft|marginRight|paddingTop|paddingBottom|paddingLeft|paddingRight)\s*:/g

// Store reads inside worklets
const STORE_READ_IN_WORKLET_PATTERN =
  /useProgressStore|getState\(\)/

// Animated element markers
const ANIMATED_ELEMENT_PATTERN = /Animated\.(View|Text|Image|ScrollView)/g

/**
 * Extract the content of all useAnimatedStyle blocks from source.
 * Handles nested braces to capture the full callback body.
 */
function extractAnimatedStyleBlocks(source: string): string[] {
  const blocks: string[] = []
  const marker = 'useAnimatedStyle('
  let searchFrom = 0

  while (true) {
    const startIdx = source.indexOf(marker, searchFrom)
    if (startIdx === -1) break

    // Find the opening brace of the callback
    let braceStart = source.indexOf('{', startIdx)
    if (braceStart === -1) break

    // Walk forward tracking brace depth
    let depth = 0
    let i = braceStart
    while (i < source.length) {
      if (source[i] === '{') depth++
      else if (source[i] === '}') {
        depth--
        if (depth === 0) break
      }
      i++
    }

    blocks.push(source.slice(braceStart, i + 1))
    searchFrom = i + 1
  }

  return blocks
}

/**
 * Strip single-line and multi-line comments from source code.
 */
function stripComments(source: string): string {
  // Remove multi-line comments
  let stripped = source.replace(/\/\*[\s\S]*?\*\//g, '')
  // Remove single-line comments
  stripped = stripped.replace(/\/\/[^\n]*/g, '')
  return stripped
}

describe('Animation Performance Audit', () => {
  describe('no layout properties in animated styles', () => {
    FILES_TO_AUDIT.forEach((filePath) => {
      const fileName = path.basename(filePath)

      it(`${fileName} — useAnimatedStyle blocks contain only transform/opacity`, () => {
        expect(fs.existsSync(filePath)).toBe(true)

        const raw = fs.readFileSync(filePath, 'utf-8')
        const source = stripComments(raw)
        const blocks = extractAnimatedStyleBlocks(source)

        // If no useAnimatedStyle, nothing to check — pass trivially
        if (blocks.length === 0) return

        const violations: string[] = []
        blocks.forEach((block, idx) => {
          const matches = block.match(LAYOUT_PROPERTY_PATTERN)
          if (matches) {
            violations.push(
              `Block ${idx + 1}: found forbidden properties: ${[...new Set(matches)].join(', ')}`
            )
          }
        })

        expect(violations).toEqual([])
      })
    })
  })

  describe('no store reads inside worklets', () => {
    FILES_TO_AUDIT.forEach((filePath) => {
      const fileName = path.basename(filePath)

      it(`${fileName} — no Zustand store reads inside useAnimatedStyle/runOnUI`, () => {
        expect(fs.existsSync(filePath)).toBe(true)

        const raw = fs.readFileSync(filePath, 'utf-8')
        const source = stripComments(raw)
        const blocks = extractAnimatedStyleBlocks(source)

        if (blocks.length === 0) return

        const violations: string[] = []
        blocks.forEach((block, idx) => {
          if (STORE_READ_IN_WORKLET_PATTERN.test(block)) {
            violations.push(
              `Block ${idx + 1}: contains store read (useProgressStore or getState()) inside worklet`
            )
          }
        })

        expect(violations).toEqual([])
      })
    })
  })

  describe('animated element count under limit', () => {
    const MAX_ANIMATED_ELEMENTS = 15

    FILES_TO_AUDIT.forEach((filePath) => {
      const fileName = path.basename(filePath)

      it(`${fileName} — fewer than ${MAX_ANIMATED_ELEMENTS} Animated.* elements`, () => {
        expect(fs.existsSync(filePath)).toBe(true)

        const source = fs.readFileSync(filePath, 'utf-8')
        const matches = source.match(ANIMATED_ELEMENT_PATTERN)
        const count = matches ? matches.length : 0

        expect(count).toBeLessThan(MAX_ANIMATED_ELEMENTS)
      })
    })
  })
})
