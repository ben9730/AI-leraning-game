import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useProgressStore } from '@/store/useProgressStore'
import { useLanguage } from '@/hooks/useLanguage'
import { BadgeGrid } from '@/components/BadgeGrid'
import { ProgressRing } from '@/components/ProgressRing'
import { deriveBadges } from '@shared/gamification/badges'
import { getLevel } from '@shared/store/types'
import { LEVEL_THRESHOLDS } from '@shared/gamification/constants'

export function ProfilePage() {
  const { t } = useTranslation()
  const { currentLanguage, toggleLanguage } = useLanguage()

  const xpTotal = useProgressStore(s => s.xpTotal)
  const streakCount = useProgressStore(s => s.streakCount)
  const completedLessons = useProgressStore(s => s.completedLessons)
  const peakStreak = useProgressStore(s => s.peakStreak)
  const streakFreezeUsedEver = useProgressStore(s => s.streakFreezeUsedEver)

  const level = getLevel(xpTotal)
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const prevThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const fillRatio = nextThreshold > prevThreshold
    ? (xpTotal - prevThreshold) / (nextThreshold - prevThreshold)
    : 1

  const badges = useMemo(
    () => deriveBadges(completedLessons, peakStreak, xpTotal, streakFreezeUsedEver),
    [completedLessons, peakStreak, xpTotal, streakFreezeUsedEver],
  )

  return (
    <div className="flex-1 overflow-y-auto py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Page title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          {t('profile.title')}
        </h1>

        {/* Language switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="w-full mb-6 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {currentLanguage === 'en'
            ? t('language.switchToHebrew')
            : t('language.switchToEnglish')}
        </button>

        {/* Stats grid — 2x2 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* XP Total */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{xpTotal}</p>
            <p className="text-xs font-normal text-gray-500">{t('profile.xp')}</p>
          </div>

          {/* Current Streak */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{streakCount}</p>
            <p className="text-xs font-normal text-gray-500">{t('profile.streak')}</p>
          </div>

          {/* Level with ProgressRing */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center">
            <ProgressRing fill={fillRatio} size={56} strokeWidth={5} level={level} />
            <p className="text-xs font-normal text-gray-500 mt-1">
              {t('gamification.level', { level })}
            </p>
          </div>

          {/* Lessons Completed */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{completedLessons.length}</p>
            <p className="text-xs font-normal text-gray-500">{t('profile.lessonsCompleted')}</p>
          </div>
        </div>

        {/* Badge section */}
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          {t('profile.badges')}
        </h2>
        <BadgeGrid badges={badges} />
      </div>
    </div>
  )
}
