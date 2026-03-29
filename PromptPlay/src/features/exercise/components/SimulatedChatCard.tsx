import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useTranslation } from 'react-i18next'
import type { SimulatedChatExercise } from '@/src/content/schema'
import type { EvaluationResult } from '../types'
import { evaluateSimulatedChat } from '../evaluators/evaluateSimulatedChat'
import { FeedbackCard } from './FeedbackCard'

type ChatState = 'writing' | 'response-revealed' | 'scored'

interface SimulatedChatCardProps {
  exercise: SimulatedChatExercise
  onComplete: (result: EvaluationResult) => void
}

export function SimulatedChatCard({ exercise, onComplete }: SimulatedChatCardProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'he'

  const [text, setText] = useState('')
  const [chatState, setChatState] = useState<ChatState>('writing')
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [submittedText, setSubmittedText] = useState('')

  const handleSubmit = () => {
    if (!text.trim()) return
    const res = evaluateSimulatedChat(exercise, text, lang)
    setResult(res)
    setSubmittedText(text)
    setChatState('response-revealed')
    if (res.passed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const handleSeeScore = () => {
    setChatState('scored')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.prompt}>{exercise.prompt[lang]}</Text>

      {(exercise.systemContext ?? (exercise as any).systemPrompt) && (
        <View style={styles.contextBox}>
          <Text style={styles.contextLabel}>Context</Text>
          <Text style={styles.contextText}>{(exercise.systemContext ?? (exercise as any).systemPrompt)[lang]}</Text>
        </View>
      )}

      {chatState === 'writing' && (
        <>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="Write your prompt here..."
            value={text}
            onChangeText={setText}
            editable={true}
            accessibilityLabel="Your prompt"
            textAlignVertical="top"
          />

          <Pressable
            style={[styles.submitButton, !text.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!text.trim()}
            accessibilityRole="button"
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </Pressable>
        </>
      )}

      {(chatState === 'response-revealed' || chatState === 'scored') && (
        <View style={styles.chatContainer}>
          {/* User message bubble */}
          <View style={styles.userBubble}>
            <Text style={styles.userBubbleText}>{submittedText}</Text>
          </View>

          {/* AI response bubble */}
          <View style={styles.aiBubble}>
            <Text style={styles.aiBubbleLabel}>AI</Text>
            <Text style={styles.aiBubbleText}>{exercise.preScriptedResponse?.[lang] ?? "Thanks for your prompt! Based on what you wrote, I'd be happy to help. Let me work through this step by step..."}</Text>
          </View>

          {chatState === 'response-revealed' && (
            <Pressable
              style={styles.seeScoreButton}
              onPress={handleSeeScore}
              accessibilityRole="button"
            >
              <Text style={styles.seeScoreButtonText}>See Score</Text>
            </Pressable>
          )}
        </View>
      )}

      {chatState === 'scored' && result && (
        <View style={styles.feedbackContainer}>
          <FeedbackCard
            result={result}
            rubric={exercise.rubric}
            modelAnswer={exercise.modelAnswer}
            lang={lang}
          />

          <Pressable
            style={styles.continueButton}
            onPress={() => onComplete(result)}
            accessibilityRole="button"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingStart: 24,
    paddingEnd: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    lineHeight: 26,
  },
  contextBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingTop: 14,
    paddingBottom: 14,
    paddingStart: 16,
    paddingEnd: 16,
    borderStartWidth: 3,
    borderStartColor: '#aaa',
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  contextText: {
    fontSize: 15,
    color: '#1a1a2e',
    lineHeight: 22,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingTop: 14,
    paddingBottom: 14,
    paddingStart: 16,
    paddingEnd: 16,
    fontSize: 15,
    color: '#1a1a2e',
    minHeight: 110,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#c4c4c4',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  chatContainer: {
    gap: 8,
  },
  // User message: right-aligned, brand purple background
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    borderTopEndRadius: 4,
    borderTopStartRadius: 16,
    paddingTop: 10,
    paddingBottom: 10,
    paddingStart: 14,
    paddingEnd: 14,
    maxWidth: '80%',
  },
  userBubbleText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  // AI message: left-aligned, light grey background
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    borderTopStartRadius: 4,
    borderTopEndRadius: 16,
    paddingTop: 10,
    paddingBottom: 10,
    paddingStart: 14,
    paddingEnd: 14,
    maxWidth: '80%',
  },
  aiBubbleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  aiBubbleText: {
    color: '#1a1a2e',
    fontSize: 15,
    lineHeight: 22,
  },
  seeScoreButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  seeScoreButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  feedbackContainer: {
    gap: 16,
  },
  continueButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
})
