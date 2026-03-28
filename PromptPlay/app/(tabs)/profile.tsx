import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage, isRTL } from '@/src/i18n';
import { useProgressStore } from '@/src/store/useProgressStore';
import { getLevel } from '@/src/store/types';
import { deriveBadges } from '@/src/features/gamification/badges';
import { DAILY_GOAL_XP } from '@/src/features/gamification/constants';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'he';
  const rtl = isRTL();
  const textAlign = rtl ? 'right' : 'left';

  const xpTotal = useProgressStore(s => s.xpTotal);
  const streakCount = useProgressStore(s => s.streakCount);
  const completedLessons = useProgressStore(s => s.completedLessons);
  const peakStreak = useProgressStore(s => s.peakStreak);
  const streakFreezeUsedEver = useProgressStore(s => s.streakFreezeUsedEver);
  const dailyGoal = useProgressStore(s => s.dailyGoal);

  const level = getLevel(xpTotal);
  const badges = deriveBadges(completedLessons, peakStreak, xpTotal, streakFreezeUsedEver);
  const dailyGoalXP = dailyGoal ? DAILY_GOAL_XP[dailyGoal] : null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { textAlign }]}>{t('profile.title')}</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{level}</Text>
          <Text style={styles.statLabel}>{t('gamification.level', { level: '' }).trim()}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{xpTotal}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{streakCount}</Text>
          <Text style={styles.statLabel}>{t('streak.days', { count: streakCount })}</Text>
        </View>
      </View>

      {/* Daily goal */}
      {dailyGoalXP !== null && (
        <View style={styles.goalRow}>
          <Text style={[styles.goalText, { textAlign }]}>
            {t('gamification.daily_goal')}: {dailyGoalXP} XP
          </Text>
        </View>
      )}

      {/* Achievements section */}
      <Text style={[styles.sectionTitle, { textAlign }]}>
        {currentLang === 'he' ? 'הישגים' : 'Achievements'}
      </Text>

      <View style={styles.badgeGrid}>
        {badges.map(badge => (
          <View
            key={badge.id}
            style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}
          >
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
            <Text style={[styles.badgeTitle, { textAlign }, !badge.earned && styles.badgeTitleLocked]}>
              {t(badge.titleKey)}
            </Text>
            <Text style={[styles.badgeDescription, { textAlign }, !badge.earned && styles.badgeDescriptionLocked]}>
              {t(badge.descriptionKey)}
            </Text>
            <View style={[styles.badgeStatusBadge, badge.earned ? styles.badgeStatusEarned : styles.badgeStatusLocked]}>
              <Text style={[styles.badgeStatusText, badge.earned ? styles.badgeStatusTextEarned : styles.badgeStatusTextLocked]}>
                {badge.earned ? t('badge.earned') : t('badge.locked')}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Language toggle */}
      <Pressable
        style={styles.langButton}
        onPress={() => setLanguage(currentLang === 'en' ? 'he' : 'en')}>
        <Text style={styles.langButtonText}>
          {currentLang === 'en'
            ? t('language.switchToHebrew')
            : t('language.switchToEnglish')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingStart: 16,
    paddingEnd: 16,
    paddingTop: 48,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1a1a2e',
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f0ff',
    borderRadius: 16,
    paddingTop: 20,
    paddingBottom: 20,
    paddingStart: 16,
    paddingEnd: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#d4ceee',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  goalRow: {
    backgroundColor: '#f3f0ff',
    borderRadius: 12,
    paddingTop: 12,
    paddingBottom: 12,
    paddingStart: 16,
    paddingEnd: 16,
    marginBottom: 24,
  },
  goalText: {
    fontSize: 14,
    color: '#6C63FF',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
    width: '100%',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: '#f3f0ff',
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 16,
    paddingStart: 14,
    paddingEnd: 14,
    alignItems: 'center',
  },
  badgeCardLocked: {
    backgroundColor: '#f8f8f8',
    opacity: 0.65,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
    width: '100%',
    textAlign: 'center',
  },
  badgeTitleLocked: {
    color: '#999',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#555',
    marginBottom: 10,
    width: '100%',
    textAlign: 'center',
  },
  badgeDescriptionLocked: {
    color: '#bbb',
  },
  badgeStatusBadge: {
    borderRadius: 8,
    paddingTop: 4,
    paddingBottom: 4,
    paddingStart: 10,
    paddingEnd: 10,
  },
  badgeStatusEarned: {
    backgroundColor: '#6C63FF',
  },
  badgeStatusLocked: {
    backgroundColor: '#e0e0e0',
  },
  badgeStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeStatusTextEarned: {
    color: '#fff',
  },
  badgeStatusTextLocked: {
    color: '#999',
  },
  langButton: {
    paddingStart: 24,
    paddingEnd: 24,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  langButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
