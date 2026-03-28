/**
 * Tone guard: ensures no guilt-framing language appears in gamification-related
 * i18n keys. GAME-09 requirement — no punishment, no loss-framing.
 *
 * Scans only keys under: gamification.*, streak.*, badge.*, level.*
 * Exercise feedback keys (e.g. exercise.failed) are excluded — they use
 * "failed" to describe wrong answers, which is instructional, not punitive.
 */

import enCommon from '../../i18n/en/common.json'
import heCommon from '../../i18n/he/common.json'

type JSONValue = string | number | boolean | null | JSONObject | JSONValue[]
type JSONObject = { [key: string]: JSONValue }

const GUILT_WORDS = [
  'lose', 'lost', 'miss', 'missed', 'fail', 'failed',
  'die', 'dying', 'break', 'breaking', 'punish', 'shame', 'guilt',
]

const SCOPED_KEYS = ['gamification', 'streak', 'badge', 'level']

function extractScopedStrings(obj: JSONObject, parentKey = ''): string[] {
  const results: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key
    const isScoped = SCOPED_KEYS.some(scope =>
      fullKey === scope || fullKey.startsWith(`${scope}.`)
    )
    if (typeof value === 'string') {
      if (isScoped) results.push(value)
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      results.push(...extractScopedStrings(value as JSONObject, fullKey))
    }
  }
  return results
}

describe('tone audit — no guilt-framing in gamification i18n', () => {
  const enStrings = extractScopedStrings(enCommon as JSONObject)
  const heStrings = extractScopedStrings(heCommon as JSONObject)

  it('finds scoped strings to test (sanity check)', () => {
    expect(enStrings.length).toBeGreaterThan(0)
    expect(heStrings.length).toBeGreaterThan(0)
  })

  for (const word of GUILT_WORDS) {
    it(`English gamification strings do not contain "${word}"`, () => {
      const offending = enStrings.filter(s =>
        s.toLowerCase().includes(word.toLowerCase())
      )
      expect(offending).toHaveLength(0)
    })
  }

  it('Hebrew gamification strings do not contain guilt-framing in English loanwords', () => {
    // Check for any English guilt words appearing in Hebrew strings (loanwords/mixed text)
    const offendingWords = GUILT_WORDS.filter(word =>
      heStrings.some(s => s.toLowerCase().includes(word.toLowerCase()))
    )
    expect(offendingWords).toHaveLength(0)
  })
})
