import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { isRTL } from '@/src/i18n';
import { chapters } from '@/src/content/curriculum';
import { loadLesson } from '@/src/content/loader';
import { useProgressStore } from '@/src/store/useProgressStore'
import { StreakBadge } from '@/src/features/gamification/streakDisplay';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const rtl = isRTL();
  const textAlign = rtl ? 'right' : 'left';
  const lang = i18n.language as 'en' | 'he';

  const completedLessons = useProgressStore(s => s.completedLessons);
  const unlockedLessons = useProgressStore(s => s.unlockedLessons);

  const chapter = chapters[0];
  const lessonRows = chapter.lessonIds.map((id) => {
    const lesson = loadLesson(id);
    const isCompleted = completedLessons.includes(id);
    const isUnlocked = unlockedLessons.includes(id);
    return { id, lesson, isCompleted, isUnlocked };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { textAlign }]}>{t('home.title')}</Text>

      <StreakBadge />

      <View style={[styles.lessonList, styles.lessonListSpacing]}>
        {lessonRows.map(({ id, lesson, isCompleted, isUnlocked }) => {
          const locked = !isUnlocked;
          return (
            <Pressable
              key={id}
              style={({ pressed }) => [
                styles.lessonRow,
                locked && styles.lessonRowLocked,
                pressed && !locked && styles.lessonRowPressed,
              ]}
              onPress={() => {
                if (!locked) {
                  router.push(`/(lesson)/${id}` as any);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`${lesson.content.title[lang]}${isCompleted ? ', completed' : locked ? ', locked' : ''}`}
              accessibilityState={{ disabled: locked }}
            >
              {/* Order badge */}
              <View style={[styles.orderBadge, isCompleted && styles.orderBadgeCompleted, locked && styles.orderBadgeLocked]}>
                <Text style={styles.orderBadgeText}>
                  {isCompleted ? '✓' : String(lesson.order)}
                </Text>
              </View>

              {/* Lesson info */}
              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonTitle, locked && styles.textLocked, { textAlign }]}>
                  {lesson.content.title[lang]}
                </Text>
                <Text style={[styles.lessonMeta, locked && styles.textLocked, { textAlign }]}>
                  {lesson.exercises.length} exercises · +{lesson.xpReward} XP
                </Text>
              </View>

              {/* Status indicator */}
              <View style={styles.statusArea}>
                {isCompleted ? (
                  <Text style={styles.completedBadge}>{lang === 'he' ? 'הושלם' : 'Done'}</Text>
                ) : locked ? (
                  <Text style={styles.lockedBadge}>{lang === 'he' ? 'נעול' : 'Locked'}</Text>
                ) : (
                  <Text style={styles.startBadge}>{lang === 'he' ? 'התחל' : 'Start'}</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingStart: 24,
    paddingEnd: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 28,
  },
  lessonList: {
    gap: 12,
  },
  lessonListSpacing: {
    marginTop: 20,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e8e8f0',
    borderRadius: 14,
    paddingTop: 14,
    paddingBottom: 14,
    paddingStart: 14,
    paddingEnd: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonRowLocked: {
    backgroundColor: '#fafafa',
    borderColor: '#ebebeb',
    shadowOpacity: 0,
    elevation: 0,
  },
  lessonRowPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  orderBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeCompleted: {
    backgroundColor: '#22c55e',
  },
  orderBadgeLocked: {
    backgroundColor: '#d1d5db',
  },
  orderBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  lessonInfo: {
    flex: 1,
    gap: 3,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  lessonMeta: {
    fontSize: 13,
    color: '#888',
  },
  textLocked: {
    color: '#aaa',
  },
  statusArea: {
    alignItems: 'flex-end',
  },
  startBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
    backgroundColor: '#f0eeff',
    borderRadius: 8,
    paddingTop: 4,
    paddingBottom: 4,
    paddingStart: 10,
    paddingEnd: 10,
  },
  completedBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22c55e',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingTop: 4,
    paddingBottom: 4,
    paddingStart: 10,
    paddingEnd: 10,
  },
  lockedBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#aaa',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingTop: 4,
    paddingBottom: 4,
    paddingStart: 10,
    paddingEnd: 10,
  },
});
