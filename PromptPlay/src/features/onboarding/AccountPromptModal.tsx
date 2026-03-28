import React from 'react'
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { isRTL } from '@/src/i18n'

interface AccountPromptModalProps {
  visible: boolean
  onSignUp: () => void
  onSkip: () => void
}

export function AccountPromptModal({ visible, onSignUp, onSkip }: AccountPromptModalProps) {
  const { t } = useTranslation()
  const rtl = isRTL()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.card}>
            <Text style={[styles.title, rtl && styles.rtlText]}>
              {t('accountPrompt.title')}
            </Text>
            <Text style={[styles.description, rtl && styles.rtlText]}>
              {t('accountPrompt.description')}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.signUpButton, pressed && styles.signUpButtonPressed]}
              onPress={onSignUp}
              accessibilityRole="button"
            >
              <Text style={styles.signUpText}>{t('accountPrompt.signUp')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.skipButton, pressed && styles.skipButtonPressed]}
              onPress={onSkip}
              accessibilityRole="button"
            >
              <Text style={[styles.skipText, rtl && styles.rtlText]}>
                {t('accountPrompt.skip')}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'left',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
    textAlign: 'left',
  },
  rtlText: {
    textAlign: 'right',
  },
  signUpButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  signUpButtonPressed: {
    backgroundColor: '#5548e0',
  },
  signUpText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipButtonPressed: {
    opacity: 0.6,
  },
  skipText: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
  },
})
