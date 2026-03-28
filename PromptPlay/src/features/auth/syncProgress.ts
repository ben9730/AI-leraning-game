import { supabase } from '@/src/lib/supabase'
import { useProgressStore } from '@/src/store/useProgressStore'

const DEFAULT_UNLOCKED = 'lesson-01-what-is-prompting'

interface SyncResult {
  success?: boolean
  error?: string
}

/**
 * Upload local progress state to Supabase user_progress table.
 * Uses upsert so it works for both first-time sync and subsequent updates.
 */
export async function syncProgressToCloud(userId: string): Promise<SyncResult> {
  const { xpTotal, streakCount, completedLessons, unlockedLessons } = useProgressStore.getState()

  const { error } = await supabase.from('user_progress').upsert({
    user_id: userId,
    xp_total: xpTotal,
    streak_count: streakCount,
    completed_lessons: completedLessons,
    unlocked_lessons: unlockedLessons,
    synced_at: new Date().toISOString(),
  })

  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

/**
 * Restore cloud progress to local store — only on fresh install (no local progress).
 * If local already has progress, local wins (same-device sign-in).
 * Always ensures lesson-01 is in unlockedLessons after restore.
 */
export async function restoreProgressFromCloud(userId: string): Promise<SyncResult> {
  const { completedLessons } = useProgressStore.getState()

  // Local-first: if user already has lessons completed, do not overwrite
  if (completedLessons.length > 0) {
    return { success: true }
  }

  const { data, error } = await supabase
    .from('user_progress')
    .select('xp_total, streak_count, completed_lessons, unlocked_lessons')
    .eq('user_id', userId)
    .single()

  if (error) {
    // No row yet is normal for new users — not a hard error
    if (error.code === 'PGRST116') {
      return { success: true }
    }
    return { error: error.message }
  }

  if (data) {
    const restoredUnlocked: string[] = data.unlocked_lessons ?? []
    // Always ensure lesson-01 is unlocked to prevent stuck state
    if (!restoredUnlocked.includes(DEFAULT_UNLOCKED)) {
      restoredUnlocked.push(DEFAULT_UNLOCKED)
    }

    useProgressStore.setState({
      xpTotal: data.xp_total ?? 0,
      streakCount: data.streak_count ?? 0,
      completedLessons: data.completed_lessons ?? [],
      unlockedLessons: restoredUnlocked,
    })
  }

  return { success: true }
}
