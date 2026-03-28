import { LocalizedString } from '@/src/content/schema'

export interface EvaluationResult {
  score: number           // 0-100
  passed: boolean
  feedback: LocalizedString
  breakdown?: Record<string, number>  // Per-criterion scores (for rubric-based types)
}
