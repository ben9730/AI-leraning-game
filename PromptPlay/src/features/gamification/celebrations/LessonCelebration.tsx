import React, { useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import LottieView from 'lottie-react-native'
import * as Haptics from 'expo-haptics'

interface LessonCelebrationProps {
  visible: boolean
  onFinish: () => void
}

export function LessonCelebration({ visible, onFinish }: LessonCelebrationProps) {
  const animationRef = useRef<LottieView>(null)

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      animationRef.current?.play()
    }
  }, [visible])

  if (!visible) return null

  return (
    <View style={styles.overlay} pointerEvents="none">
      <LottieView
        ref={animationRef}
        source={require('../../../../assets/lottie/celebration.json')}
        autoPlay
        loop={false}
        onAnimationFinish={onFinish}
        style={styles.animation}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  animation: {
    flex: 1,
  },
})
