import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/src/i18n';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'he';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profile.title')}</Text>
      <Pressable
        style={styles.langButton}
        onPress={() => setLanguage(currentLang === 'en' ? 'he' : 'en')}>
        <Text style={styles.langButtonText}>
          {currentLang === 'en'
            ? t('language.switchToHebrew')
            : t('language.switchToEnglish')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingStart: 16,
    paddingEnd: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  langButton: {
    paddingStart: 24,
    paddingEnd: 24,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    marginStart: 0,
  },
  langButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
