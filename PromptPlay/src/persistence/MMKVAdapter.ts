import { MMKV } from 'react-native-mmkv'
import { StateStorage } from 'zustand/middleware'
import { PersistenceAdapter } from './PersistenceAdapter'

const storage = new MMKV()

export class MMKVAdapter implements PersistenceAdapter {
  get(key: string): string | null {
    return storage.getString(key) ?? null
  }

  set(key: string, value: string): void {
    storage.set(key, value)
  }

  remove(key: string): void {
    storage.delete(key)
  }

  clear(): void {
    storage.clearAll()
  }
}

export const mmkvStorage = storage

export const zustandMMKVStorage: StateStorage = {
  setItem: (name: string, value: string) => storage.set(name, value),
  getItem: (name: string) => storage.getString(name) ?? null,
  removeItem: (name: string) => storage.delete(name),
}
