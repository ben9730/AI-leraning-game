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
  {
    id: 2,
    title: { en: 'Your First Good Prompt', he: 'הפרומפט הטוב הראשון שלך' },
    description: { en: 'Learn to write clear, specific prompts with context', he: 'למדו לכתוב פרומפטים ברורים וספציפיים עם הקשר' },
    lessonIds: [
      'lesson-06-be-clear',
      'lesson-07-give-context',
      'lesson-08-set-the-format',
      'lesson-09-put-it-together',
      'lesson-10-your-first-good-prompt',
    ],
  },
  {
    id: 3,
    title: { en: 'Level Up Your Prompts', he: 'שדרגו את הפרומפטים שלכם' },
    description: { en: 'Advanced techniques: roles, constraints, examples, and iteration', he: 'טכניקות מתקדמות: תפקידים, אילוצים, דוגמאות ואיטרציה' },
    lessonIds: [
      'lesson-11-give-ai-a-role',
      'lesson-12-set-constraints',
      'lesson-13-few-shot-prompting',
      'lesson-14-iteration',
      'lesson-15-chain-of-thought',
    ],
  },
  {
    id: 4,
    title: { en: 'Real-World Skills', he: 'מיומנויות לעולם האמיתי' },
    description: { en: 'Apply your skills to writing, research, brainstorming, and more', he: 'יישמו את המיומנויות שלכם בכתיבה, מחקר, סיעור מוחות ועוד' },
    lessonIds: [
      'lesson-16-writing-help',
      'lesson-17-summarizing',
      'lesson-18-brainstorming',
      'lesson-19-research-assistance',
      'lesson-20-debugging-bad-output',
    ],
  },
]

export const curriculum: string[] = chapters.flatMap((ch) => ch.lessonIds)
