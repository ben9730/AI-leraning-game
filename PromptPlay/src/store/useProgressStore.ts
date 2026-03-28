import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandMMKVStorage } from '../persistence/MMKVAdapter'
import { UserProgress, XPTransaction } from './types'

const todayISO = (): string => new Date().toISOString().slice(0, 10)

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

type ProgressStore = UserProgress & { _hasHydrated: boolean; setHasHydrated: (v: boolean) => void }

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      // Hydration flag (not persisted)
      _hasHydrated: false,
      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),

      // Default state
      userId: generateId(),
      xpTotal: 0,
      xpHistory: [] as XPTransaction[],
      streakCount: 0,
      lastActivityDate: '',
      completedLessons: [] as string[],
      unlockedLessons: ['lesson-01-what-is-prompting'] as string[],
      language: 'en' as const,
      dailyGoal: null,
      streakFreezes: 0,

      // Actions
      addXP: (amount: number, source: XPTransaction['source']) => {
        const tx: XPTransaction = { amount, source, timestamp: Date.now() }
        set(state => ({
          xpTotal: state.xpTotal + amount,
          xpHistory: [...state.xpHistory, tx],
        }))
      },

      completeLesson: (lessonId: string) => {
        const { completedLessons } = get()
        if (!completedLessons.includes(lessonId)) {
          set({ completedLessons: [...completedLessons, lessonId] })
        }
      },

      unlockLesson: (lessonId: string) => {
        const { unlockedLessons } = get()
        if (!unlockedLessons.includes(lessonId)) {
          set({ unlockedLessons: [...unlockedLessons, lessonId] })
        }
      },

      setLanguage: (lang: 'en' | 'he') => set({ language: lang }),

      setDailyGoal: (goal: UserProgress['dailyGoal']) => set({ dailyGoal: goal }),

      updateStreak: () => {
        const { lastActivityDate, streakCount } = get()
        const today = todayISO()
        if (lastActivityDate !== today) {
          set({ streakCount: streakCount + 1, lastActivityDate: today })
        }
      },
    }),
    {
      name: 'user-progress',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: (state) => {
        // Exclude non-serializable / runtime-only fields from persistence
        const { _hasHydrated, setHasHydrated, ...persisted } = state
        return persisted
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
        }
      },
    }
  )
)

export const useHasHydrated = () => useProgressStore(s => s._hasHydrated)
