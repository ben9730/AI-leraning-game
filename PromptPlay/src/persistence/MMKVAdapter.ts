import { Platform } from 'react-native'
import { StateStorage } from 'zustand/middleware'
import { PersistenceAdapter } from './PersistenceAdapter'

const isWeb = Platform.OS === 'web'

// Web: use localStorage. Native: use MMKV.
const nativeStorage = isWeb
  ? null
  : (() => {
      const { MMKV } = require('react-native-mmkv')
      return new MMKV()
    })()

export class MMKVAdapter implements PersistenceAdapter {
  get(key: string): string | null {
    if (isWeb) return localStorage.getItem(key)
    return nativeStorage!.getString(key) ?? null
  }

  set(key: string, value: string): void {
    if (isWeb) return localStorage.setItem(key, value)
    nativeStorage!.set(key, value)
  }

  remove(key: string): void {
    if (isWeb) return localStorage.removeItem(key)
    nativeStorage!.delete(key)
  }

  clear(): void {
    if (isWeb) return localStorage.clear()
    nativeStorage!.clearAll()
  }
}

export const mmkvStorage = nativeStorage

export const zustandMMKVStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    if (isWeb) localStorage.setItem(name, value)
    else nativeStorage!.set(name, value)
  },
  getItem: (name: string) => {
    if (isWeb) return localStorage.getItem(name)
    return nativeStorage!.getString(name) ?? null
  },
  removeItem: (name: string) => {
    if (isWeb) localStorage.removeItem(name)
    else nativeStorage!.delete(name)
  },
}
