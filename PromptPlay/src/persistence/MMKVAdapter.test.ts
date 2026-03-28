import { MMKVAdapter } from './MMKVAdapter'
import { PersistenceAdapter } from './PersistenceAdapter'

// Mock react-native-mmkv with an in-memory Map
const mockStorage = new Map<string, string>()

jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => mockStorage.get(key) ?? undefined,
      set: (key: string, value: string) => mockStorage.set(key, value),
      delete: (key: string) => mockStorage.delete(key),
      clearAll: () => mockStorage.clear(),
    })),
  }
})

describe('MMKVAdapter', () => {
  let adapter: MMKVAdapter

  beforeEach(() => {
    mockStorage.clear()
    adapter = new MMKVAdapter()
  })

  test('Test 1: set then get returns the value', () => {
    adapter.set('myKey', 'myValue')
    expect(adapter.get('myKey')).toBe('myValue')
  })

  test('Test 2: get on non-existent key returns null', () => {
    expect(adapter.get('nonExistentKey')).toBeNull()
  })

  test('Test 3: remove then get returns null', () => {
    adapter.set('removeMe', 'someValue')
    adapter.remove('removeMe')
    expect(adapter.get('removeMe')).toBeNull()
  })

  test('Test 4: clear removes all stored data', () => {
    adapter.set('key1', 'val1')
    adapter.set('key2', 'val2')
    adapter.clear()
    expect(adapter.get('key1')).toBeNull()
    expect(adapter.get('key2')).toBeNull()
  })

  test('Test 5: MMKVAdapter implements PersistenceAdapter interface', () => {
    // Type check — if this compiles, the interface is satisfied
    const typedAdapter: PersistenceAdapter = new MMKVAdapter()
    expect(typeof typedAdapter.get).toBe('function')
    expect(typeof typedAdapter.set).toBe('function')
    expect(typeof typedAdapter.remove).toBe('function')
    expect(typeof typedAdapter.clear).toBe('function')
  })
})
