import { Lesson } from './schema'
import lesson01 from './lessons/lesson-01-what-is-prompting.json'

// Static import map — required for Metro bundler static analysis.
// New lessons are added to this map as content is authored in Phase 5.
const lessons: Record<string, Lesson> = {
  'lesson-01-what-is-prompting': lesson01 as unknown as Lesson,
}

export function loadLesson(id: string): Lesson {
  const lesson = lessons[id]
  if (!lesson) throw new Error(`Lesson not found: ${id}`)
  return lesson
}

export function getAllLessonIds(): string[] {
  return Object.keys(lessons)
}
