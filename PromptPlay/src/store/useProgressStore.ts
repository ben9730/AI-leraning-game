import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { zustandMMKVStorage } from '../persistence/MMKVAdapter'
import { UserProgress, XPTransaction, getLevel } from './types'
import { calcStreakUpdate, shouldGrantFreeze } from '../features/gamification/engine'

// Use local timezone (en-CA produces YYYY-MM-DD format)
const todayISO = (): string => new Date().toLocaleDateString('en-CA')

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
      peakStreak: 0,
      pendingLevelUp: null,
      streakFreezeUsedEver: false,

      // Actions
      addXP: (amount: number, source: XPTransaction['source']) => {
        const state = get()
        const prevLevel = getLevel(state.xpTotal)
        const newLevel = getLevel(state.xpTotal + amount)
        const tx: XPTransaction = { amount, source, timestamp: Date.now() }
        set({
          xpTotal: state.xpTotal + amount,
          xpHistory: [...state.xpHistory, tx],
          ...(newLevel > prevLevel ? { pendingLevelUp: newLevel } : {}),
        })
      },

      clearPendingLevelUp: () => set({ pendingLevelUp: null }),

      consumeStreakFreeze: () => {
        const { streakFreezes } = get()
        if (streakFreezes > 0) {
          set({ streakFreezes: streakFreezes - 1, streakFreezeUsedEver: true })
        }
      },

      grantStreakFreeze: () => {
        set(state => ({ streakFreezes: state.streakFreezes + 1 }))
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
        const { lastActivityDate, streakCount, streakFreezes, peakStreak } = get()
        const today = todayISO()
        const result = calcStreakUpdate(lastActivityDate, streakCount, streakFreezes, today)

        const updates: Partial<ProgressStore> = {
          streakCount: result.newStreakCount,
          streakFreezes: result.newFreezes,
          lastActivityDate: today,
          peakStreak: Math.max(peakStreak, result.newStreakCount),
        }

        if (result.freezeConsumed) {
          updates.streakFreezeUsedEver = true
        }

        // Grant freeze at 7-day milestones (only when streak actually advanced)
        if (shouldGrantFreeze(result.newStreakCount) && result.newStreakCount > streakCount) {
          updates.streakFreezes = (updates.streakFreezes ?? result.newFreezes) + 1
        }

        set(updates)
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
          // Backfill peakStreak for existing users upgrading from older versions
          if ((state as { peakStreak?: number }).peakStreak === undefined) {
            state.peakStreak = state.streakCount
          }
          state.setHasHydrated(true)
        }
      },
    }
  )
)

export const useHasHydrated = () => useProgressStore(s => s._hasHydrated)
