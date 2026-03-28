import { describe, it, expect } from 'vitest'
import { loadLesson, getAllLessonIds, chapters, curriculum } from './index'

describe('loadLesson', () => {
  it('loads all 20 lessons from curriculum', () => {
    for (const id of curriculum) {
      const lesson = loadLesson(id)
      expect(lesson).toBeDefined()
      expect(lesson.id).toBe(id)
    }
  })

  it('each lesson has required bilingual content', () => {
    for (const id of curriculum) {
      const lesson = loadLesson(id)
      expect(typeof lesson.content.title.en).toBe('string')
      expect(lesson.content.title.en.length).toBeGreaterThan(0)
      expect(typeof lesson.content.title.he).toBe('string')
      expect(lesson.content.title.he.length).toBeGreaterThan(0)
      expect(Array.isArray(lesson.exercises)).toBe(true)
      expect(lesson.exercises.length).toBeGreaterThan(0)
    }
  })

  it('throws for unknown lesson ID', () => {
    expect(() => loadLesson('nonexistent')).toThrow('Lesson not found: nonexistent')
  })
})

describe('getAllLessonIds', () => {
  it('returns exactly 20 lesson IDs', () => {
    const ids = getAllLessonIds()
    expect(ids).toHaveLength(20)
  })

  it('matches curriculum order', () => {
    const ids = getAllLessonIds()
    expect(ids).toEqual(curriculum)
  })
})

describe('curriculum chapters', () => {
  it('has 4 chapters', () => {
    expect(chapters).toHaveLength(4)
  })

  it('each chapter has 5 lessons', () => {
    for (const chapter of chapters) {
      expect(chapter.lessonIds).toHaveLength(5)
    }
  })

  it('total lessons across chapters is 20', () => {
    const total = chapters.reduce((sum, ch) => sum + ch.lessonIds.length, 0)
    expect(total).toBe(20)
  })

  it('every chapter lessonId is loadable', () => {
    for (const chapter of chapters) {
      for (const lessonId of chapter.lessonIds) {
        expect(() => loadLesson(lessonId)).not.toThrow()
      }
    }
  })
})
