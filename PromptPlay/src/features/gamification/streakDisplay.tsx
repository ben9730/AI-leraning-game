import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useProgressStore } from '@/src/store/useProgressStore'

interface StreakBadgeProps {
  /** Compact mode for embedding in headers */
  compact?: boolean
}

/**
 * StreakBadge — displays the current streak count with a flame icon.
 * Shows a freeze indicator when streak freezes are available.
 * RTL-safe: uses paddingStart/End, marginStart/End throughout.
 * Tone: encouraging only — no guilt, no loss-framing (GAME-09).
 */
export function StreakBadge({ compact = false }: StreakBadgeProps) {
  const { t } = useTranslation()
  const streakCount = useProgressStore(s => s.streakCount)
  const streakFreezes = useProgressStore(s => s.streakFreezes)

  if (streakCount === 0) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <Text style={[styles.startText, compact && styles.startTextCompact]}>
          {t('streak.start')}
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Flame + count */}
      <View style={styles.streakRow}>
        <Text style={[styles.flameIcon, compact && styles.flameIconCompact]}>🔥</Text>
        <Text style={[styles.streakCount, compact && styles.streakCountCompact]}>
          {streakCount}
        </Text>
        {!compact && (
          <Text style={styles.streakLabel}>
            {t('streak.days', { count: streakCount })}
          </Text>
        )}
      </View>

      {/* Freeze indicator */}
      {streakFreezes > 0 && (
        <View style={[styles.freezeRow, compact && styles.freezeRowCompact]}>
          <Text style={[styles.freezeIcon, compact && styles.freezeIconCompact]}>🛡️</Text>
          <Text style={[styles.freezeCount, compact && styles.freezeCountCompact]}>
            {streakFreezes}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingStart: 16,
    paddingEnd: 16,
    backgroundColor: '#fff8f0',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ffe0b2',
    gap: 12,
    alignSelf: 'flex-start',
  },
  containerCompact: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingStart: 10,
    paddingEnd: 10,
    gap: 6,
    borderRadius: 10,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flameIcon: {
    fontSize: 22,
  },
  flameIconCompact: {
    fontSize: 16,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#e65c00',
    marginStart: 2,
  },
  streakCountCompact: {
    fontSize: 15,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#b34700',
    marginStart: 4,
  },
  freezeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    paddingTop: 3,
    paddingBottom: 3,
    paddingStart: 7,
    paddingEnd: 7,
  },
  freezeRowCompact: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingStart: 5,
    paddingEnd: 5,
  },
  freezeIcon: {
    fontSize: 13,
  },
  freezeIconCompact: {
    fontSize: 11,
  },
  freezeCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1565c0',
  },
  freezeCountCompact: {
    fontSize: 11,
  },
  startText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e65c00',
  },
  startTextCompact: {
    fontSize: 13,
  },
})
