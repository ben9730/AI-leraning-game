import { EXERCISE_REGISTRY } from '../registry'

describe('EXERCISE_REGISTRY', () => {
  it('contains entries for all 5 supported exercise types', () => {
    expect(EXERCISE_REGISTRY['mcq']).toBeDefined()
    expect(EXERCISE_REGISTRY['pick-better']).toBeDefined()
    expect(EXERCISE_REGISTRY['free-text']).toBeDefined()
    expect(EXERCISE_REGISTRY['fill-blank']).toBeDefined()
    expect(EXERCISE_REGISTRY['spot-problem']).toBeDefined()
  })

  it('each registered entry is a function (React component)', () => {
    for (const key of ['mcq', 'pick-better', 'free-text', 'fill-blank', 'spot-problem'] as const) {
      expect(typeof EXERCISE_REGISTRY[key]).toBe('function')
    }
  })

  it('simulated-chat is NOT in registry (deferred to Phase 5)', () => {
    expect(EXERCISE_REGISTRY['simulated-chat']).toBeUndefined()
  })
})
