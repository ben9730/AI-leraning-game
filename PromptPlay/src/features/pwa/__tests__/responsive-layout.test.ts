/**
 * Responsive Layout Audit — Static Analysis Guard
 *
 * Purpose: Prevent directional CSS anti-patterns that break RTL layouts and
 * prevent responsive design on narrow (320px) mobile viewports.
 *
 * Rules:
 * - Use paddingStart/End, marginStart/End — never paddingLeft/Right, marginLeft/Right
 * - Use start/end positioning — never left/right
 * - No hardcoded pixel widths over 300px in tab screens
 */

import * as fs from 'fs'
import * as path from 'path'

const TABS_DIR = path.resolve(__dirname, '../../../../../app/(tabs)')
const EXERCISE_DIR = path.resolve(__dirname, '../../exercise')

const TAB_FILES = [
  path.join(TABS_DIR, 'index.tsx'),
  path.join(TABS_DIR, 'skill-tree.tsx'),
  path.join(TABS_DIR, 'profile.tsx'),
]

const EXERCISE_FILE = path.join(EXERCISE_DIR, 'ExerciseRunner.tsx')

/**
 * Strip comments from source to avoid false positives on commented-out code.
 */
function stripComments(source: string): string {
  let stripped = source.replace(/\/\*[\s\S]*?\*\//g, '')
  stripped = stripped.replace(/\/\/[^\n]*/g, '')
  return stripped
}

/**
 * Extract StyleSheet.create({...}) blocks from source.
 * Returns the raw style object content for targeted analysis.
 */
function extractStyleBlocks(source: string): string {
  const marker = 'StyleSheet.create('
  const startIdx = source.indexOf(marker)
  if (startIdx === -1) return ''

  // Find the opening brace
  let braceStart = source.indexOf('{', startIdx)
  if (braceStart === -1) return ''

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

  return source.slice(braceStart, i + 1)
}

/**
 * Find directional style property violations.
 * Excludes legitimate uses like borderTopLeftRadius, borderBottomRightRadius,
 * and string values (e.g. textAlign: 'left' as RTL-dynamic values are allowed
 * when set programmatically from isRTL() — we only flag static style objects).
 *
 * Pattern targets property keys in style objects:
 *   paddingLeft:, paddingRight:, marginLeft:, marginRight:
 *   and positional: left: <number>, right: <number>
 *   (but NOT borderTopLeftRadius, color: '#...left...', etc.)
 */
function findDirectionalViolations(styleBlock: string): string[] {
  const violations: string[] = []

  // Check for directional margin/padding property keys
  const directionalPropPattern =
    /\b(paddingLeft|paddingRight|marginLeft|marginRight)\s*:/g
  let match: RegExpExecArray | null
  while ((match = directionalPropPattern.exec(styleBlock)) !== null) {
    violations.push(match[0].replace(':', '').trim())
  }

  // Check for positional left:/right: with numeric values (not border-radius compounds)
  // Negative lookbehind: not preceded by border, Top, Bottom
  const positionalPattern = /(?<!border(?:Top|Bottom)?)\b(left|right)\s*:\s*[\d-]/g
  while ((match = positionalPattern.exec(styleBlock)) !== null) {
    const prop = match[0].split(':')[0].trim()
    violations.push(`${prop} (positional)`)
  }

  return [...new Set(violations)]
}

/**
 * Find hardcoded pixel widths over the threshold in style blocks.
 */
function findHardcodedWidthViolations(
  styleBlock: string,
  threshold = 300
): string[] {
  const violations: string[] = []
  // Match width: <number> (not percentage strings)
  const widthPattern = /\bwidth\s*:\s*(\d+)/g
  let match: RegExpExecArray | null
  while ((match = widthPattern.exec(styleBlock)) !== null) {
    const value = parseInt(match[1], 10)
    if (value > threshold) {
      violations.push(`width: ${value}px (exceeds ${threshold}px threshold)`)
    }
  }
  return violations
}

describe('Responsive Layout Audit', () => {
  describe('no directional left/right style properties in tab screens', () => {
    TAB_FILES.forEach((filePath) => {
      const fileName = path.basename(filePath)

      it(`${fileName} — no paddingLeft/Right, marginLeft/Right, or positional left/right`, () => {
        expect(fs.existsSync(filePath)).toBe(true)

        const raw = fs.readFileSync(filePath, 'utf-8')
        const source = stripComments(raw)
        const styleBlock = extractStyleBlocks(source)

        const violations = findDirectionalViolations(styleBlock)

        expect(violations).toEqual([])
      })
    })
  })

  describe('no hardcoded widths over 300px in tab screens', () => {
    TAB_FILES.forEach((filePath) => {
      const fileName = path.basename(filePath)

      it(`${fileName} — no hardcoded width > 300px`, () => {
        expect(fs.existsSync(filePath)).toBe(true)

        const raw = fs.readFileSync(filePath, 'utf-8')
        const source = stripComments(raw)
        const styleBlock = extractStyleBlocks(source)

        const violations = findHardcodedWidthViolations(styleBlock)

        expect(violations).toEqual([])
      })
    })
  })

  describe('exercise components use RTL-safe properties', () => {
    it('ExerciseRunner.tsx — no directional padding/margin violations', () => {
      expect(fs.existsSync(EXERCISE_FILE)).toBe(true)

      const raw = fs.readFileSync(EXERCISE_FILE, 'utf-8')
      const source = stripComments(raw)
      const styleBlock = extractStyleBlocks(source)

      const violations = findDirectionalViolations(styleBlock)

      expect(violations).toEqual([])
    })
  })
})
