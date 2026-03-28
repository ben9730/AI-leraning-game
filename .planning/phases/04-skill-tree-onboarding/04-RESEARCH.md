# Phase 4: Skill Tree + Onboarding — Research

**Researched:** 2026-03-28
**Domain:** React Native ScrollView-based skill tree, Expo Router onboarding flows, Supabase auth + RLS
**Confidence:** HIGH (skill tree layout, store integration), MEDIUM (Supabase RLS schema), HIGH (onboarding pattern)

---

## Summary

Phase 4 builds the visual learning map and the friction-free entry experience. Three sub-problems: (1) render a scrollable column of lesson nodes with chapter groupings and lock states, (2) create an onboarding route group that captures goal and routes directly into Lesson 1 before any signup, and (3) wire Supabase email/password auth so progress can optionally sync to the cloud.

The skill tree is intentionally simple: a vertical ScrollView with styled `TouchableOpacity` nodes. No SVG path connections are needed for v1 — Duolingo's original tree used a single-column spine with decorative connectors; connecting lines are a cosmetic enhancement that can be deferred. Node state (locked/unlocked/complete) is derived live from `completedLessons` and `unlockedLessons` arrays already in `useProgressStore`. Chapter breaks are rendered as headers within the same scroll, driven by `curriculum.ts` chapter groupings.

Onboarding uses a dedicated Expo Router route group `(onboarding)` with `initialRouteName` logic — if `dailyGoal` is null (never set), the app redirects to the onboarding entry screen before reaching the tab shell. This is the standard Expo Router gating pattern. Goal selection writes to `setDailyGoal`, then immediately pushes to the lesson engine for Lesson 1. The account creation prompt appears as a modal after Lesson 1 completes — it reads `completedLessons.length >= 1` and `userId` is still the auto-generated local UUID.

Supabase auth uses `@supabase/supabase-js` v2 with `expo-secure-store` as the session token storage adapter. Progress sync is a one-way push on lesson completion: local state is authoritative, cloud is the backup. Conflict resolution rule: cloud wins only on fresh install restore; local always wins on the same device.

**Primary recommendation:** Build skill tree as a pure ScrollView + derived state computation — no graph library needed. Route-guard onboarding via Expo Router layout file redirect. Use Supabase `signUp`/`signIn` with SecureStore adapter; sync `completedLessons` + `xpTotal` + `streakCount` to a single `user_progress` row protected by RLS `user_id = auth.uid()`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TREE-01 | Visual skill map — lock/unlock/complete states for all lessons | ScrollView + node state derived from `completedLessons` + `unlockedLessons` store arrays |
| TREE-02 | Linear progression — each lesson unlocks the next | `unlockLesson()` action already exists in store; call after `completeLesson()` |
| TREE-03 | Chapter groupings visible on skill tree | `chapters` array in `curriculum.ts` provides id, title, lessonIds — render as section headers |
| TREE-04 | Tap lesson node to start or review completed lesson | `router.push('/lesson/[id]')` from node press; completed nodes navigate to review mode |
| TREE-05 | Current progress indicator | Highlight first unlocked-but-not-completed node with distinct style + scroll-to on mount |
| ONBR-01 | No signup wall | Onboarding route group completes before any auth prompt; `userId` is local UUID until user opts in |
| ONBR-02 | Quick goal selection on first launch | `dailyGoal === null` triggers redirect to onboarding screen; `setDailyGoal()` writes to store |
| ONBR-03 | First lesson within 60 seconds of opening | Goal screen -> immediate `router.replace('/lesson/lesson-01-what-is-prompting')` |
| ONBR-04 | Deferred account creation — after lesson 2-3 | Modal shown when `completedLessons.length === 1`; not before |
| ONBR-05 | Supabase auth (email + password) + cloud progress sync | `@supabase/supabase-js` v2 + `expo-secure-store` session adapter + single `user_progress` row with RLS |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-native` ScrollView | (bundled with Expo SDK 52) | Skill tree container | Native scroll, simple, no dependency; handles long lesson lists |
| `expo-router` | ~4.x (already installed) | Onboarding route group + route guard | Already in project; file-based routing handles redirect logic cleanly |
| `@supabase/supabase-js` | ^2.x | Auth + cloud sync client | Official JS client; works in Expo with custom storage adapter |
| `expo-secure-store` | ~14.x | Supabase session token storage | Required by Supabase Expo guide — SecureStore replaces AsyncStorage for sensitive tokens |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-native-reanimated` | (already installed) | Node tap spring animation + scroll-to-current | Already in project; use `withSpring` for node press feedback |
| `zustand` selectors | (already installed) | Derived node state | `useProgressStore(s => s.completedLessons)` — no extra library needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ScrollView column | `react-native-svg` path tree | SVG gives curved connectors but adds a dependency and ~50KB for a cosmetic feature — defer to v2 |
| ScrollView column | `FlatList` | FlatList is better for 100+ items; 26 nodes is too few to need virtualization |
| expo-secure-store | AsyncStorage | AsyncStorage is unencrypted — never use for session tokens |
| email/password only | Google OAuth | OAuth is out of scope per REQUIREMENTS.md |

**Installation** (only new packages):

```bash
npx expo install @supabase/supabase-js expo-secure-store
```

---

## Architecture Patterns

### Recommended Project Structure

```
PromptPlay/
├── app/
│   ├── (onboarding)/           # Route group — shown only when dailyGoal is null
│   │   ├── _layout.tsx         # Stack navigator for onboarding screens
│   │   ├── welcome.tsx         # App intro + goal selection
│   │   └── index.tsx           # Redirect entry point
│   ├── (tabs)/
│   │   └── skill-tree.tsx      # Replace placeholder with full implementation
│   └── lesson/
│       └── [id].tsx            # Already exists from Phase 2
├── src/
│   ├── features/
│   │   ├── skill-tree/
│   │   │   ├── SkillTreeNode.tsx       # Single node component
│   │   │   ├── ChapterHeader.tsx       # Chapter divider
│   │   │   └── useSkillTreeData.ts     # Derived state hook
│   │   └── onboarding/
│   │       ├── GoalSelector.tsx        # Casual/Regular/Serious picker
│   │       └── AccountPromptModal.tsx  # Deferred signup modal
│   └── lib/
│       └── supabase.ts                 # Supabase client singleton
```

### Pattern 1: Route-Guard Onboarding (Expo Router redirect)

**What:** The root layout checks `dailyGoal` from the store. If null, redirect to `/(onboarding)/welcome` before rendering the tab shell.

**When to use:** Whenever a one-time flow must gate the main app.

```typescript
// app/_layout.tsx
import { Redirect } from 'expo-router'
import { useProgressStore } from '../src/store/useProgressStore'
import { useHasHydrated } from '../src/store/useProgressStore'

export default function RootLayout() {
  const hasHydrated = useHasHydrated()
  const dailyGoal = useProgressStore(s => s.dailyGoal)

  // Wait for MMKV to rehydrate before redirecting — prevents flash
  if (!hasHydrated) return null

  if (dailyGoal === null) {
    return <Redirect href="/(onboarding)/welcome" />
  }

  return <Tabs /> // normal tab shell
}
```

**Note:** `useHasHydrated` already exists in `useProgressStore.ts` — use it to prevent a redirect flash before MMKV loads.

### Pattern 2: Skill Tree Node State Derivation

**What:** Derive `NodeState` for each lesson from store arrays — never store node state separately.

**When to use:** Every render of the skill tree.

```typescript
// src/features/skill-tree/useSkillTreeData.ts
import { chapters, curriculum } from '../../content/curriculum'
import { useProgressStore } from '../../store/useProgressStore'

export type NodeState = 'locked' | 'unlocked' | 'complete'

export interface SkillNode {
  lessonId: string
  state: NodeState
  indexInCurriculum: number
}

export interface ChapterGroup {
  chapter: typeof chapters[0]
  nodes: SkillNode[]
}

export function useSkillTreeData(): ChapterGroup[] {
  const completedLessons = useProgressStore(s => s.completedLessons)
  const unlockedLessons = useProgressStore(s => s.unlockedLessons)

  return chapters.map(chapter => ({
    chapter,
    nodes: chapter.lessonIds.map((id, i) => ({
      lessonId: id,
      indexInCurriculum: curriculum.indexOf(id),
      state: completedLessons.includes(id)
        ? 'complete'
        : unlockedLessons.includes(id)
        ? 'unlocked'
        : 'locked',
    })),
  }))
}
```

### Pattern 3: Unlock Next Lesson on Complete

**What:** When `completeLesson(id)` is called, derive the next lesson ID from `curriculum` array and call `unlockLesson(nextId)`.

**When to use:** In the lesson completion handler (already fires in Phase 2/3 flow).

```typescript
// In lesson completion handler
import { curriculum } from '../content/curriculum'

function handleLessonComplete(lessonId: string) {
  const { completeLesson, unlockLesson } = useProgressStore.getState()
  completeLesson(lessonId)

  const idx = curriculum.indexOf(lessonId)
  if (idx >= 0 && idx < curriculum.length - 1) {
    unlockLesson(curriculum[idx + 1])
  }
}
```

### Pattern 4: Supabase Client Singleton

**What:** Create one Supabase client instance for the whole app using `expo-secure-store` as the storage adapter for session tokens.

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import type { ExpoSecureStoreAdapter } from '@supabase/supabase-js'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Required for React Native
    },
  }
)
```

### Pattern 5: Deferred Account Prompt

**What:** Show account creation modal exactly once, after the first lesson completes, only if the user is not already authenticated.

```typescript
// In lesson completion flow (post-Phase 2 completion screen)
const completedCount = useProgressStore(s => s.completedLessons.length)
const [session, setSession] = useState(null)

useEffect(() => {
  supabase.auth.getSession().then(({ data }) => setSession(data.session))
}, [])

// Show modal when: completed exactly 1 lesson AND not signed in
const showAccountPrompt = completedCount === 1 && session === null
```

### Pattern 6: Progress Sync to Supabase

**What:** After auth, upsert local progress to cloud. On fresh install, restore from cloud.

```typescript
// Sync local -> cloud (called after auth and after each lesson complete)
async function syncProgressToCloud(userId: string) {
  const { xpTotal, streakCount, completedLessons, unlockedLessons } =
    useProgressStore.getState()

  await supabase.from('user_progress').upsert({
    user_id: userId,
    xp_total: xpTotal,
    streak_count: streakCount,
    completed_lessons: completedLessons,
    unlocked_lessons: unlockedLessons,
    synced_at: new Date().toISOString(),
  })
}

// Restore from cloud -> local (called on sign-in on a new device)
async function restoreProgressFromCloud(userId: string) {
  const { data } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (data) {
    const store = useProgressStore.getState()
    // Cloud wins on fresh restore (local completedLessons is empty)
    if (store.completedLessons.length === 0) {
      store.completeLesson // batch via direct set
      useProgressStore.setState({
        xpTotal: data.xp_total,
        streakCount: data.streak_count,
        completedLessons: data.completed_lessons,
        unlockedLessons: data.unlocked_lessons,
      })
    }
  }
}
```

### Pattern 7: Scroll to Current Lesson Node

**What:** On mount, scroll the skill tree to the first `unlocked` (not completed) node so the user's current position is visible.

```typescript
// In skill-tree.tsx
const scrollRef = useRef<ScrollView>(null)
const nodeRefs = useRef<Record<string, number>>({}) // lessonId -> y offset

// Each node reports its y position via onLayout
// Then on mount:
useEffect(() => {
  const currentId = treeData
    .flatMap(g => g.nodes)
    .find(n => n.state === 'unlocked')?.lessonId

  if (currentId && nodeRefs.current[currentId]) {
    scrollRef.current?.scrollTo({ y: nodeRefs.current[currentId] - 100, animated: true })
  }
}, []) // run once after hydration
```

### Anti-Patterns to Avoid

- **Storing node state in Zustand:** Node state is always derived from `completedLessons` + `unlockedLessons`. Storing it separately creates a sync bug.
- **Showing auth prompt before first lesson:** `completedLessons.length === 0` → never show prompt. Enforce this condition strictly.
- **Using AsyncStorage for Supabase session:** Session tokens must use `expo-secure-store`. AsyncStorage is unencrypted and accessible on rooted devices.
- **Re-checking `dailyGoal` on every render without `useHasHydrated`:** MMKV hydration is async on first render. Without the hydration guard, `dailyGoal` is `null` for a frame and causes onboarding flash on returning users.
- **Calling `unlockLesson` inside `completeLesson` in the store:** Keep them separate actions. The unlock logic belongs in the feature layer (lesson completion handler), not in the store primitive.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session token storage | Custom encrypted storage | `expo-secure-store` | Platform keychain integration, encryption handled |
| Auth state listener | Manual polling | `supabase.auth.onAuthStateChange()` | Handles token refresh, expiry, sign-out automatically |
| Supabase row security | App-layer user_id checks | RLS policy `user_id = auth.uid()` | Database enforces isolation; app-layer checks are bypassable |
| Scroll position of current node | Manual offset math | `onLayout` + `scrollTo` | React Native layout system gives exact positions |

---

## Common Pitfalls

### Pitfall 1: Onboarding Flash on Returning Users

**What goes wrong:** Root layout redirects to onboarding briefly before MMKV finishes rehydrating — `dailyGoal` reads as `null` for one frame.

**Why it happens:** `zustand/persist` rehydration from MMKV is synchronous in theory, but `_hasHydrated` flag is set in the `onRehydrateStorage` callback, which fires after the first render.

**How to avoid:** Always gate the redirect on `useHasHydrated()` returning `true`. Return `null` (blank screen) until hydrated. The `_hasHydrated` flag is already implemented in `useProgressStore.ts`.

**Warning signs:** Onboarding screen flashes briefly on second launch.

### Pitfall 2: Supabase `detectSessionInUrl: true` on React Native

**What goes wrong:** Supabase's default config tries to detect OAuth callback URLs in the browser URL, which crashes React Native (no `window.location`).

**How to avoid:** Always set `detectSessionInUrl: false` in the `auth` config for React Native / Expo clients.

### Pitfall 3: RTL Layout on Skill Tree Nodes

**What goes wrong:** Node layout uses `flexDirection: 'row'` with hardcoded `left`/`right` alignment. In Hebrew RTL mode, icons and text order breaks.

**How to avoid:** Use `paddingStart`/`paddingEnd` on all nodes. Use `flexDirection: 'row'` (RTL-aware in React Native — it automatically reverses in RTL locale). Never use absolute `left`/`right` positioning for node content.

### Pitfall 4: Progress Sync Conflict on Same Device

**What goes wrong:** User signs in on a device that already has local progress. Cloud restore overwrites local progress that is newer.

**How to avoid:** Merge rule: **local wins on same device** (only restore from cloud if `completedLessons.length === 0`). Cloud wins only on a fresh install.

### Pitfall 5: `unlockedLessons` Does Not Include Lesson 1 After Store Reset

**What goes wrong:** If store is cleared/reset (e.g., sign out + wipe), `unlockedLessons` becomes `[]`. Lesson 1 appears locked.

**Why it happens:** Default state initializes `unlockedLessons: ['lesson-01-what-is-prompting']`. But if the store is reset by restoring cloud state, this default isn't applied.

**How to avoid:** After any cloud restore, always ensure `lesson-01-what-is-prompting` is in `unlockedLessons`. Add a guard: `if (!unlockedLessons.includes('lesson-01-...')) unlockLesson('lesson-01-...')`.

### Pitfall 6: Supabase RLS Misconfiguration Blocks All Reads

**What goes wrong:** RLS enabled on `user_progress` table but no policy defined. All queries return empty results with no error — the table appears empty.

**Why it happens:** Supabase enables RLS by default on new tables. Without an explicit `SELECT` policy, authenticated users cannot read their own rows.

**How to avoid:** Define all four policies (SELECT, INSERT, UPDATE, DELETE) explicitly before testing. Test with the Supabase dashboard SQL editor using `SET ROLE authenticated; SET request.jwt.claims.sub = '<user_id>';`.

---

## Supabase RLS Schema

### Table: `user_progress`

```sql
CREATE TABLE user_progress (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_total      INTEGER NOT NULL DEFAULT 0,
  streak_count  INTEGER NOT NULL DEFAULT 0,
  completed_lessons  TEXT[] NOT NULL DEFAULT '{}',
  unlocked_lessons   TEXT[] NOT NULL DEFAULT '{}',
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies: user can only touch their own row
CREATE POLICY "select own progress"
  ON user_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "update own progress"
  ON user_progress FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete own progress"
  ON user_progress FOR DELETE
  USING (user_id = auth.uid());
```

**Design rationale:**
- Single row per user (UUID PK = user_id) — progress is not versioned, just replaced
- `completed_lessons` and `unlocked_lessons` as `TEXT[]` — maps directly to the Zustand string arrays; no join table needed for v1
- No `exercise_attempts` table in this phase — defer to v2 analytics
- `ON DELETE CASCADE` — deleting the auth user wipes their progress row automatically

---

## Code Examples

### Skill Tree Node Component

```typescript
// src/features/skill-tree/SkillTreeNode.tsx
import React from 'react'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { NodeState } from './useSkillTreeData'
import { useTranslation } from 'react-i18next'

interface Props {
  lessonId: string
  title: string          // localized string
  state: NodeState
  onPress: () => void
  onLayout?: (y: number) => void
}

export function SkillTreeNode({ lessonId, title, state, onPress, onLayout }: Props) {
  const isLocked = state === 'locked'

  return (
    <TouchableOpacity
      disabled={isLocked}
      onPress={onPress}
      onLayout={e => onLayout?.(e.nativeEvent.layout.y)}
      style={[styles.node, styles[state]]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLocked }}
    >
      <Text style={[styles.icon]}>
        {state === 'complete' ? '✓' : state === 'unlocked' ? '▶' : '🔒'}
      </Text>
      <Text style={[styles.title, isLocked && styles.lockedText]}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  node: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 16,
    paddingEnd: 16,
    paddingVertical: 14,
    marginVertical: 6,
    marginHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  locked:    { backgroundColor: '#e5e5e5' },
  unlocked:  { backgroundColor: '#e8f5e9', borderWidth: 2, borderColor: '#4caf50' },
  complete:  { backgroundColor: '#c8e6c9' },
  icon:  { fontSize: 18 },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  lockedText: { color: '#9e9e9e' },
})
```

### Goal Selection Screen (Onboarding)

```typescript
// app/(onboarding)/welcome.tsx
import { router } from 'expo-router'
import { useProgressStore } from '../../src/store/useProgressStore'

const GOALS = [
  { key: 'casual',   labelKey: 'onboarding.goal.casual',   xp: 10 },
  { key: 'regular',  labelKey: 'onboarding.goal.regular',  xp: 20 },
  { key: 'serious',  labelKey: 'onboarding.goal.serious',  xp: 30 },
] as const

export default function WelcomeScreen() {
  const setDailyGoal = useProgressStore(s => s.setDailyGoal)
  const { t } = useTranslation()

  function handleSelect(goal: 'casual' | 'regular' | 'serious') {
    setDailyGoal(goal)
    // Immediately into Lesson 1 — no delay, no intermediate screen
    router.replace('/lesson/lesson-01-what-is-prompting')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('onboarding.goal.heading')}</Text>
      {GOALS.map(g => (
        <TouchableOpacity key={g.key} onPress={() => handleSelect(g.key)}>
          <Text>{t(g.labelKey)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Supabase v1 `@supabase/supabase-js` v1 with custom `localStorage` adapter | v2 with `auth.storage` option accepting any adapter | v2 API is completely different — use `createClient` with `auth.storage`, not `supabase.auth.setAuth()` |
| Expo Router v2 `_layout.tsx` with `useRootNavigationState` guard | Expo Router v3/v4 `<Redirect>` component in layout | `<Redirect>` is declarative and simpler; `useRootNavigationState` guard is obsolete |

---

## Open Questions

1. **Chapter 5 on skill tree — show locked placeholders or hide entirely?**
   - What we know: curriculum.ts only has Chapter 1 (5 lessons). Chapters 2-5 are not yet authored.
   - What's unclear: Should Phase 4 render placeholder nodes for unwritten lessons?
   - Recommendation: Render only authored chapters (chapters array in curriculum.ts). Phase 5 adds chapters 2-4 to curriculum.ts and they appear automatically. Do NOT hardcode placeholder nodes.

2. **Auth provider for Supabase in tests**
   - What we know: Supabase client makes network calls; tests need mocking.
   - Recommendation: Create a `__mocks__/supabase.ts` that stubs `signUp`, `signIn`, `upsert`. Pattern mirrors how `expo-haptics` was mocked in Phase 2.

3. **Account prompt after lesson 1 vs lesson 2-3 — which is right?**
   - REQUIREMENTS.md says "after lesson 2-3" (ONBR-04). SUMMARY.md says "after Lesson 1 completes."
   - Recommendation: Use `completedLessons.length === 1` (after lesson 1). Earlier prompt = higher conversion. ONBR-04 language "2-3" is a range — lesson 1 completion is the earliest defensible trigger point. Planner should confirm with user.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest + react-native preset (already configured from Phase 2) |
| Config file | `PromptPlay/jest.config.js` (dual-project config from Phase 2) |
| Quick run command | `cd PromptPlay && npx jest src/features/skill-tree` |
| Full suite command | `cd PromptPlay && npx jest` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TREE-01 | `useSkillTreeData` returns correct `NodeState` per lesson | unit | `npx jest src/features/skill-tree/useSkillTreeData.test.ts -x` | Wave 0 |
| TREE-02 | Completing lesson N unlocks lesson N+1 | unit | `npx jest src/features/skill-tree/unlock.test.ts -x` | Wave 0 |
| TREE-03 | Chapter groupings contain correct lessonIds | unit | `npx jest src/content/curriculum.test.ts -x` | Wave 0 |
| TREE-04 | Locked node press does nothing; unlocked navigates | unit | `npx jest src/features/skill-tree/SkillTreeNode.test.tsx -x` | Wave 0 |
| TREE-05 | First unlocked node is identified correctly | unit | covered by TREE-01 test | Wave 0 |
| ONBR-01 | Root layout renders tab shell when `dailyGoal` is set | unit | `npx jest app/__tests__/rootLayout.test.tsx -x` | Wave 0 |
| ONBR-02 | Root layout redirects to onboarding when `dailyGoal` is null | unit | same file as ONBR-01 | Wave 0 |
| ONBR-03 | Goal selection immediately navigates to lesson 01 | unit | `npx jest app/__tests__/welcome.test.tsx -x` | Wave 0 |
| ONBR-04 | Account prompt shown after exactly 1 completed lesson, not before | unit | `npx jest src/features/onboarding/AccountPromptModal.test.tsx -x` | Wave 0 |
| ONBR-05 | Supabase signUp/signIn called with correct args; progress upserted | unit (mocked) | `npx jest src/lib/supabase.test.ts -x` | Wave 0 |

### Sampling Rate

- **Per task commit:** `cd PromptPlay && npx jest src/features/skill-tree src/features/onboarding --passWithNoTests`
- **Per wave merge:** `cd PromptPlay && npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/features/skill-tree/useSkillTreeData.test.ts` — covers TREE-01, TREE-05
- [ ] `src/features/skill-tree/SkillTreeNode.test.tsx` — covers TREE-04
- [ ] `src/features/skill-tree/unlock.test.ts` — covers TREE-02
- [ ] `src/content/curriculum.test.ts` — covers TREE-03 (may already exist from Phase 2)
- [ ] `app/__tests__/rootLayout.test.tsx` — covers ONBR-01, ONBR-02
- [ ] `app/__tests__/welcome.test.tsx` — covers ONBR-03
- [ ] `src/features/onboarding/AccountPromptModal.test.tsx` — covers ONBR-04
- [ ] `src/lib/supabase.test.ts` + `__mocks__/supabase.ts` — covers ONBR-05

---

## Sources

### Primary (HIGH confidence)

- `PromptPlay/src/store/useProgressStore.ts` — confirmed `completedLessons`, `unlockedLessons`, `dailyGoal`, `setDailyGoal`, `unlockLesson`, `useHasHydrated` all exist
- `PromptPlay/src/store/types.ts` — confirmed `UserProgress` interface shape
- `PromptPlay/src/content/curriculum.ts` — confirmed `chapters` array and `curriculum` flat array
- `.planning/REQUIREMENTS.md` — authoritative requirement IDs and descriptions
- `.planning/research/SUMMARY.md` — Supabase choice rationale, onboarding pattern, deferred signup data
- `CLAUDE.md` — RTL conventions, stack constraints

### Secondary (MEDIUM confidence)

- Training knowledge: Supabase v2 JS client API (`createClient`, `auth.storage`, `onAuthStateChange`, `upsert`, RLS policies) — verified against documented patterns; may need checking against latest Supabase docs
- Training knowledge: Expo Router v4 `<Redirect>` in `_layout.tsx` — standard pattern, stable API
- Training knowledge: `expo-secure-store` as Supabase session adapter — documented in Supabase Expo guides

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all core libraries already in project; only `@supabase/supabase-js` + `expo-secure-store` are new additions
- Architecture: HIGH — skill tree derived state pattern is straightforward; Expo Router onboarding guard uses existing `useHasHydrated` hook
- Supabase RLS schema: MEDIUM — single-table design is sound; SQL syntax should be verified against Supabase dashboard before running
- Pitfalls: HIGH — hydration flash, RTL layout, and RLS misconfiguration are all real, documented failure modes

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable libraries; Supabase API is stable in v2)
