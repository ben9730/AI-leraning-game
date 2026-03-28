import React, { useEffect, useRef } from 'react'
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native'
import LottieView from 'lottie-react-native'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import { isRTL } from '@/src/i18n'

interface LevelUpModalProps {
  level: number
  onDismiss: () => void
}

export function LevelUpModal({ level, onDismiss }: LevelUpModalProps) {
  const { t } = useTranslation()
  const animationRef = useRef<LottieView>(null)
  const rtl = isRTL()
  const textAlign = rtl ? 'right' : 'left'

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    animationRef.current?.play()
  }, [])

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LottieView
            ref={animationRef}
            source={require('../../../../assets/lottie/level-up.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />

          <Text style={[styles.title, { textAlign }]}>
            {t('gamification.level_up')}
          </Text>

          <Text style={[styles.subtitle, { textAlign }]}>
            {t('gamification.level_up_message', { level })}
          </Text>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel={t('common.continue')}
          >
            <Text style={styles.buttonText}>{t('common.continue')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingStart: 24,
    paddingEnd: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 32,
    paddingStart: 28,
    paddingEnd: 28,
    width: '100%',
    alignItems: 'center',
  },
  animation: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 8,
    width: '100%',
  },
  subtitle: {
    fontSize: 17,
    color: '#444',
    marginBottom: 32,
    width: '100%',
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    paddingStart: 48,
    paddingEnd: 48,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
})
