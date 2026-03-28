import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { isRTL } from '@/src/i18n'
import { DAILY_GOAL_XP } from '@/src/features/gamification/constants'

type Goal = 'casual' | 'regular' | 'serious'

interface GoalSelectorProps {
  onSelect: (goal: Goal) => void
}

const GOALS: Goal[] = ['casual', 'regular', 'serious']

export function GoalSelector({ onSelect }: GoalSelectorProps) {
  const { t } = useTranslation()
  const rtl = isRTL()

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, rtl && styles.rtlText]}>
        {t('onboarding.goal.heading')}
      </Text>
      {GOALS.map((goal) => (
        <Pressable
          key={goal}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => onSelect(goal)}
          accessibilityRole="button"
          accessibilityLabel={t(`onboarding.goal.${goal}`)}
        >
          <Text style={[styles.goalLabel, rtl && styles.rtlText]}>
            {t(`onboarding.goal.${goal}`)}
          </Text>
          <Text style={[styles.xpLabel, rtl && styles.rtlText]}>
            {t('onboarding.goal.xpPerDay', { xp: DAILY_GOAL_XP[goal] })}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
    textAlign: 'left',
  },
  rtlText: {
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    backgroundColor: '#f0f4ff',
    borderColor: '#6c63ff',
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'left',
  },
  xpLabel: {
    fontSize: 14,
    color: '#6c63ff',
    marginTop: 4,
    textAlign: 'left',
  },
})
