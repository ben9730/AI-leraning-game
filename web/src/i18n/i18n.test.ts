import { describe, it, expect, beforeEach } from 'vitest'
import i18next from 'i18next'

// Import to trigger initialization side-effect
import '@/i18n'

describe('i18n initialization', () => {
  beforeEach(async () => {
    await i18next.changeLanguage('en')
  })

  it('initializes with en as default language', () => {
    expect(i18next.language).toBe('en')
  })

  it('translates home.title in English', () => {
    expect(i18next.t('home.title')).toBe('Welcome to PromptPlay')
  })

  it('translates home.title in Hebrew after changeLanguage', async () => {
    await i18next.changeLanguage('he')
    expect(i18next.t('home.title')).toBe('ברוכים הבאים ל-PromptPlay')
  })

  it('falls back to English for unknown key in Hebrew', async () => {
    // Add a key only in English namespace for test
    i18next.addResource('en', 'common', 'test_fallback_key', 'English Only Value')
    await i18next.changeLanguage('he')
    expect(i18next.t('test_fallback_key')).toBe('English Only Value')
  })
})
