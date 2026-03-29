import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * SecureStore adapter for Supabase auth token persistence (native only).
 * expo-secure-store keys must be ≤ 256 chars; Supabase keys are short.
 */
const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string): Promise<void> => {
    return SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string): Promise<void> => {
    return SecureStore.deleteItemAsync(key)
  },
}

/**
 * localStorage adapter for web — expo-secure-store is not available on web
 * and its async methods may hang (never resolve), blocking all downstream code.
 */
const WebStorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    try {
      return Promise.resolve(localStorage.getItem(key))
    } catch {
      return Promise.resolve(null)
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Storage full or unavailable — non-blocking
    }
    return Promise.resolve()
  },
  removeItem: (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key)
    } catch {
      // non-blocking
    }
    return Promise.resolve()
  },
}

const storageAdapter = Platform.OS === 'web' ? WebStorageAdapter : ExpoSecureStoreAdapter

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
