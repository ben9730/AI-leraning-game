import { Lesson } from './schema'
import lesson01 from './lessons/lesson-01-what-is-prompting.json'
import lesson02 from './lessons/lesson-02-clarity.json'
import lesson03 from './lessons/lesson-03-specificity.json'
import lesson04 from './lessons/lesson-04-context.json'
import lesson05 from './lessons/lesson-05-intent.json'

// Static import map — required for Metro bundler static analysis.
const lessons: Record<string, Lesson> = {
  'lesson-01-what-is-prompting': lesson01 as unknown as Lesson,
  'lesson-02-clarity': lesson02 as unknown as Lesson,
  'lesson-03-specificity': lesson03 as unknown as Lesson,
  'lesson-04-context': lesson04 as unknown as Lesson,
  'lesson-05-intent': lesson05 as unknown as Lesson,
}

export function loadLesson(id: string): Lesson {
  const lesson = lessons[id]
  if (!lesson) throw new Error(`Lesson not found: ${id}`)
  return lesson
}

export function getAllLessonIds(): string[] {
  return Object.keys(lessons)
}
