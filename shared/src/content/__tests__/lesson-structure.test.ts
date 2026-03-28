/**
 * Structural validation tests for all lessons 01-20.
 * Runs under the `node` jest project (ts-jest, no React Native).
 *
 * Validates:
 *  - All 20 lessons are loadable via loadLesson(id)
 *  - Each lesson id matches its loader key
 *  - Each lesson has 2-3 exercises with order fields
 *  - All LocalizedString fields have non-empty en and he
 *  - Lessons 06+ use weighted-keyword scoring
 *  - All weighted-keyword rubrics have weights summing to 1.0
 *  - chapters array has exactly 4 entries
 *  - curriculum array contains exactly 20 lesson IDs
 *  - All lesson IDs in curriculum chapters are loadable
 *  - No lesson content instructs users to click specific tool UI
 *  - Each chapter's lessonIds match the lesson's chapter field
 *  - Lesson prerequisites form a valid chain (each lesson requires the previous)
 */

import { loadLesson, getAllLessonIds } from '../loader'
import { validateRubricWeights, PromptRubric } from '../schema'
import { chapters, curriculum } from '../curriculum'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively find all objects that look like LocalizedString (have en + he keys with string values) */
function findLocalizedStrings(obj: unknown, path = ''): Array<{ path: string; en: unknown; he: unknown }> {
  if (!obj || typeof obj !== 'object') return []
  const record = obj as Record<string, unknown>

  // If this object has both en and he keys AND both are strings, it's a LocalizedString.
  // Skip objects where en/he are arrays (e.g. acceptableAnswers: {en: [...], he: [...]})
  if ('en' in record && 'he' in record && typeof record['en'] === 'string' && typeof record['he'] === 'string') {
    return [{ path, en: record['en'], he: record['he'] }]
  }

  // Otherwise recurse
  const results: Array<{ path: string; en: unknown; he: unknown }> = []
  for (const key of Object.keys(record)) {
    const child = record[key]
    if (child && typeof child === 'object') {
      results.push(...findLocalizedStrings(child, path ? `${path}.${key}` : key))
    }
  }
  return results
}

/** Collect all PromptRubric objects from a lesson */
function findRubrics(obj: unknown): PromptRubric[] {
  if (!obj || typeof obj !== 'object') return []
  const record = obj as Record<string, unknown>

  // If this looks like a PromptRubric (has criteria + scoringMethod)
  if ('criteria' in record && 'scoringMethod' in record) {
    return [record as unknown as PromptRubric]
  }

  const results: PromptRubric[] = []
  for (const key of Object.keys(record)) {
    const child = record[key]
    if (child && typeof child === 'object') {
      results.push(...findRubrics(child))
    }
  }
  return results
}

// ---------------------------------------------------------------------------
// All 20 lesson IDs
// ---------------------------------------------------------------------------

const ALL_LESSON_IDS = [
  'lesson-01-what-is-prompting',
  'lesson-02-clarity',
  'lesson-03-specificity',
  'lesson-04-context',
  'lesson-05-intent',
  'lesson-06-be-clear',
  'lesson-07-give-context',
  'lesson-08-set-the-format',
  'lesson-09-put-it-together',
  'lesson-10-your-first-good-prompt',
  'lesson-11-give-ai-a-role',
  'lesson-12-set-constraints',
  'lesson-13-few-shot-prompting',
  'lesson-14-iteration',
  'lesson-15-chain-of-thought',
  'lesson-16-writing-help',
  'lesson-17-summarizing',
  'lesson-18-brainstorming',
  'lesson-19-research-assistance',
  'lesson-20-debugging-bad-output',
]

const CHAPTER_2_IDS = [
  'lesson-06-be-clear',
  'lesson-07-give-context',
  'lesson-08-set-the-format',
  'lesson-09-put-it-together',
  'lesson-10-your-first-good-prompt',
]

const CHAPTER_3_IDS = [
  'lesson-11-give-ai-a-role',
  'lesson-12-set-constraints',
  'lesson-13-few-shot-prompting',
  'lesson-14-iteration',
  'lesson-15-chain-of-thought',
]

const CHAPTER_4_IDS = [
  'lesson-16-writing-help',
  'lesson-17-summarizing',
  'lesson-18-brainstorming',
  'lesson-19-research-assistance',
  'lesson-20-debugging-bad-output',
]

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('Lesson structure validation', () => {

  // 1. loadLesson succeeds for all 20 lesson IDs
  test('loadLesson() succeeds for all 20 lesson IDs', () => {
    for (const id of ALL_LESSON_IDS) {
      expect(() => loadLesson(id)).not.toThrow()
      expect(loadLesson(id)).toBeDefined()
    }
  })

  // 2. getAllLessonIds returns exactly 20 entries
  test('getAllLessonIds() returns 20 lesson IDs', () => {
    expect(getAllLessonIds()).toHaveLength(20)
  })

  // 3. Each lesson's id field matches its loader key
  test('Each lesson id field matches its loader key', () => {
    for (const id of ALL_LESSON_IDS) {
      const lesson = loadLesson(id)
      expect(lesson.id).toBe(id)
    }
  })

  // 4. Each lesson has 2-3 exercises
  test('Each lesson has 2-3 exercises', () => {
    for (const id of ALL_LESSON_IDS) {
      const lesson = loadLesson(id)
      expect(lesson.exercises.length).toBeGreaterThanOrEqual(2)
      expect(lesson.exercises.length).toBeLessThanOrEqual(3)
    }
  })

  // 5. Every exercise has an order field (positive integer)
  test('Every exercise has a positive integer order field', () => {
    for (const id of ALL_LESSON_IDS) {
      const lesson = loadLesson(id)
      for (const ex of lesson.exercises) {
        expect(typeof ex.order).toBe('number')
        expect(ex.order).toBeGreaterThan(0)
        expect(Number.isInteger(ex.order)).toBe(true)
      }
    }
  })

  // 6. All LocalizedString fields have non-empty en and he
  test('All LocalizedString fields have non-empty en and he values', () => {
    for (const id of ALL_LESSON_IDS) {
      const lesson = loadLesson(id)
      const localizedStrings = findLocalizedStrings(lesson)
      expect(localizedStrings.length).toBeGreaterThan(0)

      for (const { path: _path, en, he } of localizedStrings) {
        expect(typeof en).toBe('string')
        expect(typeof he).toBe('string')
        expect((en as string).trim().length).toBeGreaterThan(0)
        expect((he as string).trim().length).toBeGreaterThan(0)
      }
    }
  })

  // 7. Lessons 06-10 use scoringMethod: 'weighted-keyword' on all rubric-based exercises
  test('Lessons 06-10 use weighted-keyword scoring on all rubrics', () => {
    for (const id of CHAPTER_2_IDS) {
      const lesson = loadLesson(id)
      const rubrics = findRubrics(lesson)
      expect(rubrics.length).toBeGreaterThan(0)
      for (const rubric of rubrics) {
        expect(rubric.scoringMethod).toBe('weighted-keyword')
      }
    }
  })

  // 7b. Lessons 11-20: any rubrics present must use scoringMethod: 'weighted-keyword'
  test('Lessons 11-20: all rubrics (where present) use weighted-keyword scoring', () => {
    for (const id of [...CHAPTER_3_IDS, ...CHAPTER_4_IDS]) {
      const lesson = loadLesson(id)
      const rubrics = findRubrics(lesson)
      // Not every lesson has rubric exercises (e.g. lessons with only mcq/pick-better/spot-problem)
      // but any rubric that IS present must use weighted-keyword
      for (const rubric of rubrics) {
        expect(rubric.scoringMethod).toBe('weighted-keyword')
      }
    }
  })

  // 8. All weighted-keyword rubrics pass validateRubricWeights (weights sum to 1.0)
  test('All weighted-keyword rubrics have weights summing to 1.0', () => {
    for (const id of ALL_LESSON_IDS) {
      const lesson = loadLesson(id)
      const rubrics = findRubrics(lesson).filter(r => r.scoringMethod === 'weighted-keyword')
      for (const rubric of rubrics) {
        expect(validateRubricWeights(rubric)).toBe(true)
      }
    }
  })

  // 9. chapters array has exactly 4 entries
  test('chapters array has exactly 4 entries', () => {
    expect(chapters.length).toBe(4)
  })

  // 10. curriculum array contains exactly 20 lesson IDs
  test('curriculum array contains exactly 20 lesson IDs', () => {
    expect(curriculum).toHaveLength(20)
  })

  // 11. Chapter 1 has 5 lessons (01-05)
  test('Chapter 1 contains lesson IDs 01-05', () => {
    const ch1 = chapters.find(c => c.id === 1)
    expect(ch1).toBeDefined()
    expect(ch1!.lessonIds).toHaveLength(5)
    expect(ch1!.lessonIds).toContain('lesson-01-what-is-prompting')
    expect(ch1!.lessonIds).toContain('lesson-05-intent')
  })

  // 12. Chapter 2 has correct title and lesson IDs 06-10
  test('Chapter 2 has correct title and lesson IDs 06-10', () => {
    const ch2 = chapters.find(c => c.id === 2)
    expect(ch2).toBeDefined()
    expect(ch2!.title.en).toBe('Your First Good Prompt')
    expect(ch2!.lessonIds).toHaveLength(5)
    for (const id of CHAPTER_2_IDS) {
      expect(ch2!.lessonIds).toContain(id)
    }
  })

  // 13. Chapter 3 has correct title and lesson IDs 11-15
  test('Chapter 3 has correct title and lesson IDs 11-15', () => {
    const ch3 = chapters.find(c => c.id === 3)
    expect(ch3).toBeDefined()
    expect(ch3!.title.en).toBe('Level Up Your Prompts')
    expect(ch3!.lessonIds).toHaveLength(5)
    for (const id of CHAPTER_3_IDS) {
      expect(ch3!.lessonIds).toContain(id)
    }
  })

  // 14. Chapter 4 has correct title and lesson IDs 16-20
  test('Chapter 4 has correct title "Real-World Skills" and lesson IDs 16-20', () => {
    const ch4 = chapters.find(c => c.id === 4)
    expect(ch4).toBeDefined()
    expect(ch4!.title.en).toBe('Real-World Skills')
    expect(ch4!.lessonIds).toHaveLength(5)
    for (const id of CHAPTER_4_IDS) {
      expect(ch4!.lessonIds).toContain(id)
    }
  })

  // 15. All lesson IDs in curriculum chapters are loadable
  test('All lesson IDs in curriculum chapters are loadable', () => {
    const allCurriculumIds = chapters.flatMap(ch => ch.lessonIds)
    for (const id of allCurriculumIds) {
      expect(() => loadLesson(id)).not.toThrow()
    }
  })

  // 16. No lesson content contains tool-specific UI instructions
  test('No lesson content contains specific AI tool UI click instructions', () => {
    const badPatterns = [
      /click the chatgpt/i,
      /open chatgpt/i,
      /go to claude\.ai/i,
      /press the send button in/i,
      /click the (openai|anthropic|gemini)/i,
    ]
    for (const id of ALL_LESSON_IDS) {
      const lesson = loadLesson(id)
      const json = JSON.stringify(lesson)
      for (const pattern of badPatterns) {
        expect(json).not.toMatch(pattern)
      }
    }
  })

  // 17. Chapter 2 lessons all have chapter: 2 field
  test('Lessons 06-10 all have chapter field set to 2', () => {
    for (const id of CHAPTER_2_IDS) {
      const lesson = loadLesson(id)
      expect(lesson.chapter).toBe(2)
    }
  })

  // 18. Chapter 3 lessons all have chapter: 3 field
  test('Lessons 11-15 all have chapter field set to 3', () => {
    for (const id of CHAPTER_3_IDS) {
      const lesson = loadLesson(id)
      expect(lesson.chapter).toBe(3)
    }
  })

  // 19. Chapter 4 lessons all have chapter: 4 field
  test('Lessons 16-20 all have chapter field set to 4', () => {
    for (const id of CHAPTER_4_IDS) {
      const lesson = loadLesson(id)
      expect(lesson.chapter).toBe(4)
    }
  })

  // 20. All lessons have required top-level fields
  test('All lessons have required top-level fields', () => {
    for (const id of ALL_LESSON_IDS) {
      const lesson = loadLesson(id)
      expect(typeof lesson.id).toBe('string')
      expect(typeof lesson.order).toBe('number')
      expect(typeof lesson.chapter).toBe('number')
      expect(Array.isArray(lesson.prerequisites)).toBe(true)
      expect(typeof lesson.xpReward).toBe('number')
      expect(lesson.content).toBeDefined()
      expect(lesson.content.title).toBeDefined()
      expect(lesson.content.body).toBeDefined()
      expect(Array.isArray(lesson.exercises)).toBe(true)
    }
  })

  // 21. Each chapter's lessonIds match the lesson's chapter field
  test("Each chapter's lessonIds match the lesson's chapter field", () => {
    for (const chapter of chapters) {
      for (const lessonId of chapter.lessonIds) {
        const lesson = loadLesson(lessonId)
        expect(lesson.chapter).toBe(chapter.id)
      }
    }
  })

  // 22. Lesson prerequisites form a valid chain (each lesson requires the previous)
  test('Lesson prerequisites form a valid chain (each lesson requires the previous)', () => {
    // Lessons 02-20 should each require the immediately preceding lesson
    for (let i = 1; i < ALL_LESSON_IDS.length; i++) {
      const lesson = loadLesson(ALL_LESSON_IDS[i])
      const expectedPrereq = ALL_LESSON_IDS[i - 1]
      expect(lesson.prerequisites).toContain(expectedPrereq)
    }
    // Lesson 01 has no prerequisites
    const lesson01 = loadLesson(ALL_LESSON_IDS[0])
    expect(lesson01.prerequisites).toHaveLength(0)
  })
})
