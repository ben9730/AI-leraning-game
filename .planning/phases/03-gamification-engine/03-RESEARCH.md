# Phase 3: Gamification Engine - Research

**Researched:** 2026-03-28
**Domain:** Mobile gamification — XP, streaks, levels, badges, celebration animations
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAME-01 | XP system — base XP per exercise + streak multiplier + perfection bonus | XP formula patterns, `getLevel()` already in types.ts |
| GAME-02 | Daily streak tracking with midnight reset (local timezone) | Streak logic patterns; `updateStreak()` stub exists in store |
| GAME-03 | Streak freeze — one free freeze earned per 7-day streak milestone | Freeze grant and consumption logic patterns |
| GAME-04 | Level system — XP thresholds define levels, level-up triggers celebration | `getLevel()` + 8 thresholds already in types.ts; level-up detection on addXP |
| GAME-05 | 3-5 milestone achievement badges (first lesson, 7-day streak, chapter complete, etc.) | Badge schema + derivation patterns |
| GAME-06 | Celebration animations on lesson completion and level-up (Reanimated + Lottie) | Lottie not yet installed; Reanimated 4.2.1 already present |
| GAME-07 | No hearts/energy gate — unlimited attempts, bonus XP for perfection instead | Architecture constraint only — no implementation needed |
| GAME-08 | Daily goal setting (casual/regular/serious) affecting XP targets | `dailyGoal` field already in store; needs XP-goal mapping |
| GAME-09 | No guilt-based mechanics — friendly, encouraging tone in all notifications | Copy/UX constraint only |
</phase_requirements>

---

## Summary

Phase 3 wraps the working lesson loop (Phase 2) with a motivation layer: XP, streaks, levels, badges, and celebration animations. The good news is that a substantial amount of scaffolding is already in place — the Zustand store already has `xpTotal`, `xpHistory`, `streakCount`, `lastActivityDate`, `streakFreezes`, `dailyGoal`, and a `getLevel()` derivation function. `LessonCompletionScreen` already displays `lesson.xpReward`. The task is to implement the engine logic that powers those fields correctly, then bolt on celebration UI.

The highest-ROI mechanics — streak + streak freeze + XP — are well-understood, low-complexity, and can be implemented entirely in the Zustand store layer as pure functions. Lottie is the one new dependency required (`lottie-react-native`). Badges are best modelled as a derived, computed structure (never stored directly) to prevent desync.

The primary risk in this phase is over-engineering: the gamification logic is simple business rules, not complex infrastructure. A second risk is the streak midnight-reset, which requires careful timezone handling (local midnight, not UTC). The `updateStreak()` stub in the store has a correctness bug — it only increments the streak, it never handles streak breakage or freeze consumption. That must be fixed before any UI depends on it.

**Primary recommendation:** Implement all gamification logic as pure functions in a `gamification/engine.ts` module, tested in isolation, then wire into the store. Keep Lottie assets small (under 100KB each) to avoid PWA cache pressure.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.12 (installed) | Store for XP, streak, level state | Already in project; no new dep |
| react-native-reanimated | 4.2.1 (installed) | Progress bar fills, level-up screen transitions | Already in project; UI-thread animations |
| lottie-react-native | ^7.x | Confetti/flame celebration animation | Expo-compatible, free assets on LottieFiles |
| expo-haptics | 55.0.10 (installed) | Tap feedback on correct answer, level-up | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lottie-react-native | ^7.x | Milestone animations | Lesson completion, level-up only — not every exercise |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| lottie-react-native | react-native-confetti-cannon | Confetti cannon is simpler but limited; Lottie supports richer branded animations |
| lottie-react-native | Reanimated-only confetti | Possible but requires custom particle math; Lottie assets ship immediately |

**Installation (new dependency only):**
```bash
npx expo install lottie-react-native
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── features/
│   └── gamification/
│       ├── engine.ts          # Pure functions: calcXP, calcStreak, checkLevelUp, earnedBadges
│       ├── badges.ts          # Badge definitions + derivation logic
│       ├── constants.ts       # XP values, level thresholds, daily goal targets
│       └── celebrations/
│           ├── LessonCelebration.tsx    # Lottie confetti overlay
│           └── LevelUpModal.tsx         # Full-screen level-up screen
├── store/
│   ├── types.ts               # ADD: Badge type, streakFreezeUsed, earnedBadges
│   └── useProgressStore.ts    # FIX: updateStreak; ADD: consumeStreakFreeze, grantStreakFreeze
```

### Pattern 1: Pure Engine Functions
**What:** All gamification business logic lives in pure, side-effect-free functions in `engine.ts`. The store calls these and applies results.
**When to use:** Always — keeps logic testable without store mocking.
**Example:**
```typescript
// src/features/gamification/engine.ts

export interface XPResult {
  base: number
  streakMultiplier: number
  perfectionBonus: number
  total: number
}

export function calcXP(
  lessonBaseXP: number,
  streakCount: number,
  isPerfect: boolean
): XPResult {
  const base = lessonBaseXP
  // Streak multiplier: 1.0 at streak 0-2, 1.1 at 3-6, 1.2 at 7-13, 1.5 at 14+
  const streakMultiplier = streakCount >= 14 ? 1.5
    : streakCount >= 7  ? 1.2
    : streakCount >= 3  ? 1.1
    : 1.0
  const perfectionBonus = isPerfect ? Math.round(base * 0.5) : 0
  const total = Math.round(base * streakMultiplier) + perfectionBonus
  return { base, streakMultiplier, perfectionBonus, total }
}

export function calcStreakUpdate(
  lastActivityDate: string,   // ISO YYYY-MM-DD
  streakCount: number,
  streakFreezes: number,
  todayISO: string,           // caller provides; avoids Date.now() inside pure fn
): { newStreakCount: number; newFreezes: number; freezeConsumed: boolean } {
  const yesterday = offsetDate(todayISO, -1)
  if (lastActivityDate === todayISO) {
    // Already logged today — no change
    return { newStreakCount: streakCount, newFreezes: streakFreezes, freezeConsumed: false }
  }
  if (lastActivityDate === yesterday) {
    // Consecutive day — extend streak
    return { newStreakCount: streakCount + 1, newFreezes: streakFreezes, freezeConsumed: false }
  }
  if (lastActivityDate === offsetDate(todayISO, -2) && streakFreezes > 0) {
    // Missed one day, freeze available — consume it, continue streak
    return { newStreakCount: streakCount + 1, newFreezes: streakFreezes - 1, freezeConsumed: true }
  }
  // Streak broken
  return { newStreakCount: 1, newFreezes: streakFreezes, freezeConsumed: false }
}

function offsetDate(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
```

### Pattern 2: Derived Badges (Never Stored)
**What:** Badges are computed from existing store state on every read, not stored as a separate list.
**When to use:** Always — prevents badge/state desync and makes badge logic trivially testable.
**Example:**
```typescript
// src/features/gamification/badges.ts

export interface Badge {
  id: string
  titleKey: string       // i18n key
  descriptionKey: string
  earned: boolean
}

export function deriveBadges(
  completedLessons: string[],
  streakCount: number,
  streakHistory: number,  // highest streak ever reached
  xpTotal: number,
): Badge[] {
  return [
    {
      id: 'first_lesson',
      titleKey: 'badge.first_lesson.title',
      descriptionKey: 'badge.first_lesson.description',
      earned: completedLessons.length >= 1,
    },
    {
      id: 'streak_7',
      titleKey: 'badge.streak_7.title',
      descriptionKey: 'badge.streak_7.description',
      earned: streakHistory >= 7,       // uses peak streak, not current
    },
    {
      id: 'chapter_1_complete',
      titleKey: 'badge.chapter_1.title',
      descriptionKey: 'badge.chapter_1.description',
      earned: CHAPTER_1_LESSON_IDS.every(id => completedLessons.includes(id)),
    },
    {
      id: 'level_3',
      titleKey: 'badge.level_3.title',
      descriptionKey: 'badge.level_3.description',
      earned: getLevel(xpTotal) >= 3,
    },
    {
      id: 'streak_freeze_used',
      titleKey: 'badge.resilient.title',
      descriptionKey: 'badge.resilient.description',
      earned: /* track via store flag */ false, // see Store Types section
    },
  ]
}
```

### Pattern 3: Level-Up Detection in Store
**What:** On every `addXP` call, compare level before and after. If different, store fires an event/flag that the UI reads.
**Example:**
```typescript
// Inside useProgressStore addXP action
addXP: (amount, source) => {
  set(state => {
    const prevLevel = getLevel(state.xpTotal)
    const newXP = state.xpTotal + amount
    const newLevel = getLevel(newXP)
    return {
      xpTotal: newXP,
      xpHistory: [...state.xpHistory, { amount, source, timestamp: Date.now() }],
      pendingLevelUp: newLevel > prevLevel ? newLevel : state.pendingLevelUp,
    }
  })
},
clearPendingLevelUp: () => set({ pendingLevelUp: null }),
```

### Pattern 4: Daily Goal XP Targets
```typescript
// src/features/gamification/constants.ts
export const DAILY_GOAL_XP: Record<NonNullable<UserProgress['dailyGoal']>, number> = {
  casual:  30,   // ~5 min, 1 lesson
  regular: 60,   // ~10 min, 2 lessons
  serious: 100,  // ~15 min, 3 lessons
}

export const BASE_LESSON_XP = 20
export const BASE_EXERCISE_XP = 5

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000]
// Note: getLevel() in types.ts uses these values — keep in sync
```

### Anti-Patterns to Avoid
- **Storing currentLevel:** Already called out in `types.ts` comment. Never add a `currentLevel` field — always call `getLevel(xpTotal)`.
- **Storing earnedBadges as array:** Desync risk. Derive on read from existing state.
- **Using UTC midnight for streak reset:** Streak must reset at the user's local midnight. `new Date().toISOString().slice(0, 10)` returns UTC date — use `new Date().toLocaleDateString('en-CA')` for local YYYY-MM-DD.
- **Guilt-framing copy:** No "Your streak is about to break!" — use "Keep your streak alive!" instead. Review every string in i18n translation files.
- **Lottie animation on every exercise correct:** Only trigger Lottie on lesson completion, level-up, and badge unlock. Exercise-level feedback uses Reanimated micro-animation only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Celebration animations | Custom confetti particle system | lottie-react-native | Physics math for particle systems is non-trivial; free LottieFiles assets |
| Haptic feedback | Native module bridge | expo-haptics (already installed) | One-line call; cross-platform |
| Animation performance | JS-thread animations | Reanimated worklets (already installed) | UI-thread prevents frame drops |

**Key insight:** Gamification logic is pure business rules. The hard part is not the code — it is the correctness of edge cases (timezone midnight, freeze consumption, streak break vs. extension). Test these functions exhaustively before touching UI.

---

## Common Pitfalls

### Pitfall 1: UTC vs. Local Date in Streak Reset
**What goes wrong:** `new Date().toISOString().slice(0, 10)` returns UTC date. A user in UTC+3 doing a lesson at 11pm local time (1am UTC next day) gets credited for the wrong calendar day. Their streak breaks incorrectly at midnight UTC, not local midnight.
**Why it happens:** The existing `todayISO()` in `useProgressStore.ts` uses `toISOString()` — this is currently wrong.
**How to avoid:** Replace with `new Date().toLocaleDateString('en-CA')` which returns `YYYY-MM-DD` in local timezone consistently across platforms.
**Warning signs:** Streak tests pass in UTC but fail when run in a UTC+/- timezone.

### Pitfall 2: Streak Breaks Silently (Store Bug in updateStreak)
**What goes wrong:** The current `updateStreak()` in the store only increments — it never checks whether more than 1 day has elapsed since `lastActivityDate`. A user returning after 3 days of absence will have their streak counted as consecutive.
**How to avoid:** Replace `updateStreak()` entirely with the `calcStreakUpdate()` pure function pattern above. The store action calls the pure function and applies its result.

### Pitfall 3: Lottie Not in Expo SDK — Requires expo install
**What goes wrong:** Installing `lottie-react-native` via plain `npm install` instead of `npx expo install` mismatches the version against the Expo SDK 55 canary.
**How to avoid:** Always use `npx expo install lottie-react-native`.
**Note:** lottie-react-native v7 requires react-native 0.75+ — project is on RN 0.83.4, so compatible.

### Pitfall 4: Reward Fatigue from Celebration Overload
**What goes wrong:** Lottie fires on every correct exercise answer. By lesson 5 the user dismisses it before it finishes.
**How to avoid:** Strictly scope Lottie to: lesson completion, level-up, first badge. Exercise correct answer = Reanimated scale bounce on the check icon + single haptic pulse.

### Pitfall 5: pendingLevelUp Flag Not Cleared
**What goes wrong:** Level-up modal fires, user taps Continue, but `pendingLevelUp` is not cleared from the store. Next time they open the app the modal fires again.
**How to avoid:** Call `clearPendingLevelUp()` synchronously inside the modal's onDismiss handler, not after a navigation transition.

### Pitfall 6: Badge Derivation Uses Current Streak, Not Peak
**What goes wrong:** "7-day streak" badge is derived from `streakCount`. User earns it at day 7, then misses a day — streak drops to 0 and the badge disappears.
**How to avoid:** Store `peakStreak: number` (updated inside the streak action when a new high is reached). Derive the streak-7 badge from `peakStreak`, not `streakCount`.

---

## Code Examples

### Verified: Lottie in Expo React Native
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/lottie/
import LottieView from 'lottie-react-native'

export function LessonCelebration({ onFinish }: { onFinish: () => void }) {
  return (
    <LottieView
      source={require('@/assets/lottie/celebration.json')}
      autoPlay
      loop={false}
      onAnimationFinish={onFinish}
      style={{ width: 300, height: 300 }}
    />
  )
}
```

### Verified: Reanimated scale bounce (exercise correct)
```typescript
// Source: Reanimated docs — withSpring
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'

const scale = useSharedValue(1)
const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

function triggerCorrect() {
  scale.value = withSpring(1.25, {}, () => { scale.value = withSpring(1) })
}
```

### Verified: expo-haptics usage
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/haptics/
import * as Haptics from 'expo-haptics'

// Correct answer
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
// Level up
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
```

---

## Store Types: What Needs Adding

The following fields must be added to `UserProgress` in `types.ts` for Phase 3:

```typescript
// Add to UserProgress interface
peakStreak: number               // highest streak ever reached — for badge derivation
pendingLevelUp: number | null    // new level number, cleared after modal shown
streakFreezeUsedEver: boolean    // for "resilient" badge derivation

// Add actions
consumeStreakFreeze: () => void
grantStreakFreeze: () => void     // called when streak hits 7-day multiple
clearPendingLevelUp: () => void
```

The existing fields (`streakFreezes`, `dailyGoal`, `xpTotal`, `xpHistory`, `streakCount`, `lastActivityDate`) are all correctly shaped — Phase 3 extends, not replaces.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lottie v5 (separate android/ios) | lottie-react-native v7 unified | 2024 | Single import, no platform branch needed |
| Reanimated 2 worklets syntax | Reanimated 4 (hook-based) | 2025 | `useSharedValue`, `withSpring` API unchanged; no migration needed |
| Zustand v4 middleware | Zustand v5 (installed) | 2024 | `create<T>()()` double-call syntax — already used correctly in store |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30 + ts-jest 29 |
| Config file | jest.config.js (node preset for pure logic, RN preset for hooks) |
| Quick run command | `npx jest src/features/gamification --testPathPattern=engine` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAME-01 | calcXP returns correct total with streak multiplier + perfection bonus | unit | `npx jest src/features/gamification/engine.test.ts -t "calcXP"` | Wave 0 |
| GAME-02 | calcStreakUpdate extends streak on consecutive day, breaks on 2+ day gap | unit | `npx jest src/features/gamification/engine.test.ts -t "calcStreakUpdate"` | Wave 0 |
| GAME-03 | calcStreakUpdate consumes freeze when 1 day missed, does not consume on 2+ days | unit | `npx jest src/features/gamification/engine.test.ts -t "freeze"` | Wave 0 |
| GAME-04 | getLevel returns correct level for XP boundary values | unit | `npx jest src/store/types.test.ts -t "getLevel"` | Wave 0 |
| GAME-05 | deriveBadges returns correct earned flags for all 5 badges | unit | `npx jest src/features/gamification/badges.test.ts` | Wave 0 |
| GAME-06 | LessonCelebration renders LottieView; LevelUpModal renders on pendingLevelUp | unit | `npx jest src/features/gamification/celebrations` | Wave 0 |
| GAME-07 | No gate logic exists in store or engine (absence test) | unit | covered by GAME-01 test — no gate fields present | Wave 0 |
| GAME-08 | DAILY_GOAL_XP maps each goal to correct number | unit | `npx jest src/features/gamification/constants.test.ts` | Wave 0 |
| GAME-09 | i18n keys for streak/completion contain no guilt phrases | unit (string scan) | `npx jest src/features/gamification/tone.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx jest src/features/gamification --testPathPattern=engine`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/features/gamification/engine.test.ts` — covers GAME-01, GAME-02, GAME-03
- [ ] `src/features/gamification/badges.test.ts` — covers GAME-05
- [ ] `src/store/types.test.ts` — covers GAME-04 (`getLevel` boundary values)
- [ ] `src/features/gamification/constants.test.ts` — covers GAME-08
- [ ] `src/features/gamification/tone.test.ts` — covers GAME-09 (scans i18n keys)
- [ ] `src/features/gamification/celebrations/__tests__/` — covers GAME-06

---

## Open Questions

1. **Streak freeze grant: automatic or manual?**
   - What we know: GAME-03 says "one free freeze earned per 7-day streak milestone"
   - What's unclear: Is it granted silently in the background, or does the user see a "You earned a streak freeze!" notification?
   - Recommendation: Grant silently + show a brief toast on the day it's earned. No modal — modals interrupt flow.

2. **LottieFiles asset licensing**
   - What we know: LottieFiles free tier has some commercial restrictions
   - What's unclear: Whether the specific assets chosen require attribution
   - Recommendation: Use only LottieFiles assets with a CC0 or "Free to use commercially" license. Check each asset's license page before committing it. Alternatively, create a simple Reanimated-only confetti as a fallback for v1.

3. **`peakStreak` backfill**
   - What we know: Existing users already have a `streakCount` in persisted store
   - What's unclear: On first run after Phase 3 ships, `peakStreak` won't exist in MMKV
   - Recommendation: In `onRehydrateStorage`, set `peakStreak = streakCount` if `peakStreak` is undefined. Zustand's `persist` middleware handles missing keys gracefully if initial state defines a default.

---

## Sources

### Primary (HIGH confidence)
- `PromptPlay/src/store/types.ts` — existing `getLevel()`, `XPTransaction`, `UserProgress` shape
- `PromptPlay/src/store/useProgressStore.ts` — existing store actions and hydration pattern
- `PromptPlay/src/features/lesson/LessonCompletionScreen.tsx` — current XP display; integration point for celebrations
- `PromptPlay/package.json` — confirmed Reanimated 4.2.1, expo-haptics, no lottie yet
- Expo Official Docs — lottie-react-native integration (`npx expo install lottie-react-native`)
- Reanimated 4 Official Docs — `withSpring`, `useSharedValue`, worklet patterns

### Secondary (MEDIUM confidence)
- `.planning/research/FEATURES.md` — Duolingo retention data (streak 7-day = 3.6x, freeze = 21% churn reduction)
- `.planning/research/PITFALLS.md` — Over-gamification, reward fatigue, animation performance warnings
- `.planning/research/SUMMARY.md` — Stack confirmation, `currentLevel` derived rule

### Tertiary (LOW confidence)
- lottie-react-native v7 changelog — version compatibility claim based on npm registry (verify with `npx expo install`)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries except lottie already installed; lottie is Expo-blessed
- Architecture: HIGH — pure function engine pattern is straightforward; store shape already designed
- Pitfalls: HIGH — timezone bug in existing code is confirmed; badge desync is a documented anti-pattern
- XP/level formulas: HIGH — `getLevel()` thresholds already exist in types.ts; multiplier values are design choices, not technical unknowns

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable libraries; lottie-react-native v7 API unlikely to change)
