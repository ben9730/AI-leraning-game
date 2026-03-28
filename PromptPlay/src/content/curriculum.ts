import { Chapter } from './schema'

export const chapters: Chapter[] = [
  {
    id: 1,
    title: { en: 'What Can AI Do?', he: 'מה AI יכול לעשות?' },
    description: { en: 'Discover what AI can help you with', he: 'גלו איך AI יכול לעזור לכם' },
    lessonIds: [
      'lesson-01-what-is-prompting',
      'lesson-02-clarity',
      'lesson-03-specificity',
      'lesson-04-context',
      'lesson-05-intent',
    ],
  },
]

export const curriculum: string[] = chapters.flatMap((ch) => ch.lessonIds)
