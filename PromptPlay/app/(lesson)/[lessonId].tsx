import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LessonScreen } from '@/src/features/lesson/LessonScreen'

export default function LessonRoute() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>()
  const router = useRouter()

  if (!lessonId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lesson not found.</Text>
        <Pressable style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backButtonText}>Go Home</Text>
        </Pressable>
      </View>
    )
  }

  return <LessonScreen key={lessonId} lessonId={lessonId} />
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingStart: 24,
    paddingEnd: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingTop: 14,
    paddingBottom: 14,
    paddingStart: 32,
    paddingEnd: 32,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
