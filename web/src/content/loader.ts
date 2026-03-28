import type { Lesson } from '@shared/content/schema'

// Eagerly load all lesson JSON files at build time via Vite's import.meta.glob.
// This replaces Metro's static import map with a single glob pattern.
const lessonModules = import.meta.glob<{ default: Lesson }>(
  '../../../shared/src/content/lessons/*.json',
  { eager: true }
)

// Build a lookup map keyed by lesson ID (filename without path and extension).
// e.g. "../../shared/src/content/lessons/lesson-01-what-is-prompting.json" -> "lesson-01-what-is-prompting"
const lessons: Record<string, Lesson> = {}

for (const [path, module] of Object.entries(lessonModules)) {
  const filename = path.split('/').pop()?.replace('.json', '')
  if (filename) {
    lessons[filename] = module.default
  }
}

/**
 * Load a single lesson by its ID.
 * @throws Error if the lesson ID is not found in the bundled content.
 */
export function loadLesson(id: string): Lesson {
  const lesson = lessons[id]
  if (!lesson) throw new Error(`Lesson not found: ${id}`)
  return lesson
}

/**
 * Get all lesson IDs sorted by the lesson's order field.
 * Returns the IDs in curriculum sequence (lesson-01 through lesson-20).
 */
export function getAllLessonIds(): string[] {
  return Object.keys(lessons).sort((a, b) => lessons[a].order - lessons[b].order)
}
