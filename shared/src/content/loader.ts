import { Lesson } from './schema'
import lesson01 from './lessons/lesson-01-what-is-prompting.json'
import lesson02 from './lessons/lesson-02-clarity.json'
import lesson03 from './lessons/lesson-03-specificity.json'
import lesson04 from './lessons/lesson-04-context.json'
import lesson05 from './lessons/lesson-05-intent.json'
import lesson06 from './lessons/lesson-06-be-clear.json'
import lesson07 from './lessons/lesson-07-give-context.json'
import lesson08 from './lessons/lesson-08-set-the-format.json'
import lesson09 from './lessons/lesson-09-put-it-together.json'
import lesson10 from './lessons/lesson-10-your-first-good-prompt.json'
import lesson11 from './lessons/lesson-11-give-ai-a-role.json'
import lesson12 from './lessons/lesson-12-set-constraints.json'
import lesson13 from './lessons/lesson-13-few-shot-prompting.json'
import lesson14 from './lessons/lesson-14-iteration.json'
import lesson15 from './lessons/lesson-15-chain-of-thought.json'
import lesson16 from './lessons/lesson-16-writing-help.json'
import lesson17 from './lessons/lesson-17-summarizing.json'
import lesson18 from './lessons/lesson-18-brainstorming.json'
import lesson19 from './lessons/lesson-19-research-assistance.json'
import lesson20 from './lessons/lesson-20-debugging-bad-output.json'

// Static import map — required for Metro bundler static analysis.
const lessons: Record<string, Lesson> = {
  'lesson-01-what-is-prompting': lesson01 as unknown as Lesson,
  'lesson-02-clarity': lesson02 as unknown as Lesson,
  'lesson-03-specificity': lesson03 as unknown as Lesson,
  'lesson-04-context': lesson04 as unknown as Lesson,
  'lesson-05-intent': lesson05 as unknown as Lesson,
  'lesson-06-be-clear': lesson06 as unknown as Lesson,
  'lesson-07-give-context': lesson07 as unknown as Lesson,
  'lesson-08-set-the-format': lesson08 as unknown as Lesson,
  'lesson-09-put-it-together': lesson09 as unknown as Lesson,
  'lesson-10-your-first-good-prompt': lesson10 as unknown as Lesson,
  'lesson-11-give-ai-a-role': lesson11 as unknown as Lesson,
  'lesson-12-set-constraints': lesson12 as unknown as Lesson,
  'lesson-13-few-shot-prompting': lesson13 as unknown as Lesson,
  'lesson-14-iteration': lesson14 as unknown as Lesson,
  'lesson-15-chain-of-thought': lesson15 as unknown as Lesson,
  'lesson-16-writing-help': lesson16 as unknown as Lesson,
  'lesson-17-summarizing': lesson17 as unknown as Lesson,
  'lesson-18-brainstorming': lesson18 as unknown as Lesson,
  'lesson-19-research-assistance': lesson19 as unknown as Lesson,
  'lesson-20-debugging-bad-output': lesson20 as unknown as Lesson,
}

export function loadLesson(id: string): Lesson {
  const lesson = lessons[id]
  if (!lesson) throw new Error(`Lesson not found: ${id}`)
  return lesson
}

export function getAllLessonIds(): string[] {
  return Object.keys(lessons)
}
