import { Chapter } from './schema'

export const chapters: Chapter[] = [
  {
    id: 1,
    title: { en: 'What Can AI Do?', he: 'מה AI יכול לעשות?' },
    description: { en: 'Discover what AI can help you with', he: 'גלו איך AI יכול לעזור לכם' },
    lessonIds: ['lesson-01-what-is-prompting'],
    // Additional lesson IDs added as content is authored in Phase 5
  },
]

export const curriculum: string[] = chapters.flatMap((ch) => ch.lessonIds)
