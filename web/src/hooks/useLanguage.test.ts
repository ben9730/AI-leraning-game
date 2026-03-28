import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import i18next from 'i18next'
import { useProgressStore } from '@/store/useProgressStore'
import { useLanguage } from '@/hooks/useLanguage'

// Ensure i18n is initialized
import '@/i18n'

describe('useLanguage hook', () => {
  beforeEach(async () => {
    // Reset store to defaults
    useProgressStore.setState({ language: 'en' })
    await i18next.changeLanguage('en')
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = 'en'
  })

  it('returns currentLanguage reflecting store value', () => {
    const { result } = renderHook(() => useLanguage())
    expect(result.current.currentLanguage).toBe('en')
  })

  it('toggleLanguage from en sets document.dir to rtl', () => {
    const { result } = renderHook(() => useLanguage())
    act(() => {
      result.current.toggleLanguage()
    })
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('toggleLanguage from he sets document.dir to ltr', () => {
    useProgressStore.setState({ language: 'he' })
    const { result } = renderHook(() => useLanguage())
    act(() => {
      result.current.toggleLanguage()
    })
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('toggleLanguage calls store.setLanguage and i18next.changeLanguage', () => {
    const { result } = renderHook(() => useLanguage())
    act(() => {
      result.current.toggleLanguage()
    })
    expect(useProgressStore.getState().language).toBe('he')
    expect(i18next.language).toBe('he')
  })

  it('currentLanguage updates after setLanguage', () => {
    const { result } = renderHook(() => useLanguage())
    act(() => {
      result.current.setLanguage('he')
    })
    expect(result.current.currentLanguage).toBe('he')
    expect(result.current.isRTL).toBe(true)
  })
})
