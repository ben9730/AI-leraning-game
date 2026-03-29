import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useProgressStore } from '../store/useProgressStore'
import { GoalCard } from '../components/GoalCard'
import { AppHead } from '@/components/AppHead'

const goals = [
  { id: 'learn-basics', labelKey: 'onboarding.goal.learnBasics', icon: '🎓' },
  { id: 'improve-prompts', labelKey: 'onboarding.goal.improvePrompts', icon: '🚀' },
  { id: 'explore', labelKey: 'onboarding.goal.exploreForFun', icon: '🎮' },
] as const

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setOnboarded = useProgressStore(s => s.setOnboarded)
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)

  const handleConfirm = () => {
    if (selectedGoal === null) return
    setOnboarded(selectedGoal)
    navigate('/', { replace: true })
  }

  if (step === 1) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <AppHead title="Start Learning" />
        <h1 className="text-4xl font-bold text-indigo-600 text-center mb-3">PromptPlay</h1>
        <p className="text-base font-normal text-gray-500 text-center mb-8">
          {t('onboarding.welcome.subtitle')}
        </p>
        <button
          type="button"
          onClick={() => setStep(2)}
          className="w-full bg-indigo-600 text-white rounded-lg px-4 py-3 font-semibold text-lg hover:bg-indigo-700 transition-colors"
        >
          {t('home.start_lesson')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
      <AppHead title="Start Learning" />
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
        {t('onboarding.goal.heading')}
      </h2>
      <div role="radiogroup" className="w-full space-y-3 mb-8">
        {goals.map(goal => (
          <GoalCard
            key={goal.id}
            labelKey={goal.labelKey}
            icon={goal.icon}
            selected={selectedGoal === goal.id}
            onSelect={() => setSelectedGoal(goal.id)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={selectedGoal === null}
        className={[
          'w-full bg-indigo-600 text-white rounded-lg px-4 py-3 font-semibold text-lg transition-colors',
          selectedGoal === null
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-indigo-700',
        ].join(' ')}
      >
        {t('home.start_lesson')}
      </button>
    </div>
  )
}
