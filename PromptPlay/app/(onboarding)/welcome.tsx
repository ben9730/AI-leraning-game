import React from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { GoalSelector } from '@/src/features/onboarding/GoalSelector'
import { useProgressStore } from '@/src/store/useProgressStore'
import { isRTL } from '@/src/i18n'

export default function WelcomeScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const setDailyGoal = useProgressStore(s => s.setDailyGoal)
  const rtl = isRTL()

  const handleGoalSelect = (goal: 'casual' | 'regular' | 'serious') => {
    setDailyGoal(goal)
    // Replace so back button does not return to onboarding
    router.replace('/(lesson)/lesson-01-what-is-prompting')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, rtl && styles.rtlText]}>
            {t('onboarding.welcome.title')}
          </Text>
          <Text style={[styles.subtitle, rtl && styles.rtlText]}>
            {t('onboarding.welcome.subtitle')}
          </Text>
        </View>
        <View style={styles.selectorContainer}>
          <GoalSelector onSelect={handleGoalSelect} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  rtlText: {
    textAlign: 'center',
  },
  selectorContainer: {
    width: '100%',
  },
})
