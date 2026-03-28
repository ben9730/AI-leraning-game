import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { isRTL } from '@/src/i18n'
import { useAuth } from './useAuth'

interface AuthScreenProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AuthScreen({ onSuccess, onCancel }: AuthScreenProps) {
  const { t } = useTranslation()
  const rtl = isRTL()
  const { signUp, signIn, loading } = useAuth()

  const [mode, setMode] = useState<'signUp' | 'signIn'>('signUp')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setFormError(null)

    if (!email.trim()) {
      setFormError(t('auth.email') + ' is required')
      return
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }

    const result = mode === 'signUp'
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password)

    if (result.error) {
      setFormError(result.error)
    } else {
      onSuccess()
    }
  }

  const toggleMode = () => {
    setMode(prev => prev === 'signUp' ? 'signIn' : 'signUp')
    setFormError(null)
  }

  const textAlign = rtl ? 'right' : 'left'

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { textAlign }]}>
          {mode === 'signUp' ? t('auth.signUp.title') : t('auth.signIn.title')}
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, { textAlign }]}>{t('auth.email')}</Text>
          <TextInput
            style={[styles.input, rtl && styles.inputRTL]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            textAlign={textAlign}
          />

          <Text style={[styles.label, { textAlign }]}>{t('auth.password')}</Text>
          <TextInput
            style={[styles.input, rtl && styles.inputRTL]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••"
            placeholderTextColor="#9ca3af"
            textAlign={textAlign}
          />
        </View>

        {formError ? (
          <Text style={[styles.errorText, { textAlign }]}>{formError}</Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>
              {mode === 'signUp' ? t('auth.signUp.button') : t('auth.signIn.button')}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.switchButton, pressed && styles.switchButtonPressed]}
          onPress={toggleMode}
          accessibilityRole="button"
        >
          <Text style={[styles.switchText, { textAlign }]}>
            {mode === 'signUp' ? t('auth.switchToSignIn') : t('auth.switchToSignUp')}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
          onPress={onCancel}
          accessibilityRole="button"
        >
          <Text style={[styles.cancelText, { textAlign }]}>{t('auth.cancel')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a2e',
    backgroundColor: '#f9fafb',
  },
  inputRTL: {
    textAlign: 'right',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#6c63ff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonPressed: {
    backgroundColor: '#5548e0',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchButtonPressed: {
    opacity: 0.6,
  },
  switchText: {
    fontSize: 14,
    color: '#6c63ff',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelButtonPressed: {
    opacity: 0.6,
  },
  cancelText: {
    fontSize: 14,
    color: '#9ca3af',
  },
})
