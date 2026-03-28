// Barrel export — single import point for all content in web/
// Usage: import { loadLesson, chapters, Lesson } from '@/content'

// Loader functions
export { loadLesson, getAllLessonIds } from './loader'

// Curriculum structure
export { chapters, curriculum } from '@shared/content/curriculum'

// Types
export type {
  Lesson,
  Chapter,
  Exercise,
  LocalizedString,
} from '@shared/content/schema'
