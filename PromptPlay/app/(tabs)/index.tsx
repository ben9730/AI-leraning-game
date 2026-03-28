import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { isRTL } from '@/src/i18n';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const rtl = isRTL();
  const textAlign = rtl ? 'right' : 'left';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { textAlign }]}>{t('home.title')}</Text>

      <Pressable
        style={({ pressed }) => [styles.startCard, pressed && styles.startCardPressed]}
        onPress={() => router.push('/(lesson)/lesson-01-what-is-prompting')}
        accessibilityRole="button"
        accessibilityLabel={t('home.start_lesson')}
      >
        <Text style={styles.startCardLabel}>{t('home.start_lesson')}</Text>
        <Text style={styles.startCardSubtitle}>Lesson 1 · What is Prompting?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingStart: 24,
    paddingEnd: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 40,
  },
  startCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 24,
    paddingStart: 32,
    paddingEnd: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  startCardLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  startCardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
});
