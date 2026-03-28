# Domain Pitfalls — PromptPlay

**Domain:** Gamified mobile learning app (AI literacy / prompt skills)
**Researched:** 2026-03-28
**Project:** PromptPlay

---

## Critical Pitfalls

Mistakes that cause rewrites, user abandonment, or fundamental product failure.

---

### Pitfall 1: RTL Bolted On After Launch

**What goes wrong:** The app is built LTR-first, and Hebrew is treated as a translation layer rather than a layout requirement. When RTL is added later, absolute-positioned elements render on the wrong side, margins and paddings apply incorrectly (padding-left does not become padding-right in RTL mode), and mixed Hebrew + English text (e.g., "כדי להשתמש ב-ChatGPT") produces broken cursor behaviour, mis-wrapped lines, and garbled punctuation placement.

**Why it happens:** RTL is low-visibility during development because the default browser/OS is LTR. Teams defer it as "just a translation," not realising it requires layout-level changes.

**Consequences:** A full CSS audit and component refactor at a late stage. On React Native, platform differences between iOS (language-bundle-driven alignment) and Android (text-content-driven alignment) compound the problem — the same component behaves differently on each platform.

**Prevention:**
- Use CSS logical properties exclusively from day one: `padding-inline-start` not `padding-left`, `margin-inline-end` not `margin-right`, `inset-inline-start` not `left`.
- Set the `dir` attribute at the document root, driven by the active locale.
- For mixed-language inline content (English AI terms inside Hebrew sentences), use the `<bdi>` HTML element or React Native's `writingDirection` style to isolate directionality.
- Test on a Hebrew locale device after every UI component is built, not as a final QA pass.

**Detection:** If a component uses any hardcoded `left`, `right`, `margin-left`, `padding-right` in CSS — it will break in RTL.

---

### Pitfall 2: Over-Gamification (Feels Manipulative, Not Motivating)

**What goes wrong:** The gamification system leans too heavily on loss-aversion mechanics: streak anxiety, punishment notifications ("Your streak is about to die!"), XP inflation that means nothing, and badges that appear for trivial actions. Users initially engage but report feeling manipulated. The game layer becomes the product instead of the learning. Research shows users in this state experience guilt, stress, and self-recrimination — and eventually churn with negative brand perception.

**Why it happens:** Duolingo is the inspiration, and Duolingo uses aggressive loss-aversion (the animated flame, sad owl notifications, monetised streak freezes). Copying surface mechanics without understanding the psychological cost produces a dark-pattern app.

**Consequences:** Users complete lessons to protect streaks, not to learn. A user who misses one day loses a 30-day streak and may never return. The "learning" outcome — the actual product value — is undermined.

**Prevention:**
- Streaks should be "gentle": show progress, do not punish absence. A missed day shows a grey dot, not a broken flame.
- XP must have visible meaning: tie points to unlocking content, not arbitrary numbers.
- Badges must be earned for skill milestones, not participation ("You opened the app 3 days in a row" is hollow).
- Separate intrinsic rewards (skill tree progress, new lesson unlocked) from extrinsic rewards (XP, badges). Intrinsic must be the primary driver.
- Do not send guilt-based push notifications. Informational reminders ("New lesson available") are acceptable; loss-framing ("You're about to lose your streak!") is not.

**Detection:** Read every notification message aloud. If it creates anxiety rather than curiosity, rewrite it.

---

### Pitfall 3: First-Session Value Failure ("Tutorial Island")

**What goes wrong:** The onboarding flow explains how the app works without actually demonstrating value. Users complete a 5-screen intro, then start the first real lesson, and by minute 3 they have learned nothing actionable. Industry data: 77% of mobile users abandon an app within 3 days. The critical window is the first 2 minutes of the first session.

**Why it happens:** Builders know what the app teaches and assume users will invest in the setup cost. Users will not — they need to feel the "aha" moment before committing to any habit formation.

**Consequences:** High day-1 install-to-return rates (a leading vanity metric) but catastrophic day-3 and day-7 retention. The product cannot grow organically because no one tells a friend about something they abandoned.

**Prevention:**
- Skip the feature tour. Put the user in an interactive exercise within 60 seconds of opening the app.
- The first exercise must produce a visible, satisfying outcome: they write a prompt, they see a "before vs after" simulated AI response, they feel capable.
- Defer account creation until after the first lesson is complete (Duolingo's own best practice — they learned this from A/B testing).
- The first lesson's subject must be the highest-value, most immediately applicable skill: not "what is a prompt" but "how to get a useful answer right now."
- Design the first 2 minutes as a product demo, not an orientation.

**Detection:** Time how long it takes a cold user to feel "I just learned something useful." If it exceeds 2 minutes, restructure.

---

### Pitfall 4: Shallow Content That Teaches Nothing

**What goes wrong:** Lessons are so optimised for brevity and dopamine feedback that they contain no durable knowledge. The user taps through a lesson in 45 seconds, earns XP, and cannot apply anything they "learned" in the real world. This is the documented "Duolingo trap" — engagement metrics look strong while actual skill acquisition is near zero.

**Why it happens:** Bite-sized is misread as "shorter = better." The actual goal is density: maximum learning per minute, not maximum interactions per minute.

**Consequences:** Users who try the real AI tool after completing lessons find they still cannot prompt effectively. Word-of-mouth turns negative. The core value proposition fails.

**Prevention:**
- Every lesson must have one transferable insight stated explicitly: "Next time you use ChatGPT, do X."
- Exercises must require active production (writing a prompt), not passive recognition (selecting the "better prompt" from a multiple-choice list).
- After each exercise, show a concrete improvement: display the user's prompt alongside the model prompt, annotated with why it works.
- Resist cutting content to hit a target lesson length. If a concept requires 3 minutes to explain correctly, take 3 minutes.

**Phase relevance:** Content design phase. Every lesson must go through a "Does the user leave knowing one new thing they can apply today?" check.

---

### Pitfall 5: Wrong Difficulty Curve

**What goes wrong:** The app is too easy for 10 lessons, then spikes sharply when introducing advanced concepts. Or the reverse: the first lesson assumes too much knowledge and alienates beginners. Either pattern causes early dropout.

**Why it happens:** Content is written by people who already know the subject well (curse of knowledge). What feels "beginner" to the writer is intermediate to the audience.

**Consequences:** Beginners quit in lesson 1. Experienced users quit at lesson 11 when the repetition becomes frustrating. Neither group completes the path.

**Prevention:**
- Define the user's Day 0 state explicitly: "Knows AI tools exist, has tried them once or twice, got unhelpful responses, does not know why."
- Each lesson builds exactly one concept on top of the previous one — no gaps, no repetition.
- The first 3 lessons should feel almost too easy, to build confidence before introducing friction.
- Test content with actual beginners, not colleagues. Watch for the moment they slow down.

---

### Pitfall 6: Scoring Feels Unfair or Opaque

**What goes wrong:** The app scores user-written prompts without live AI, using rubric-based keyword matching or heuristics. Users who write a genuinely good prompt receive a low score because they used synonyms for the expected keywords. Or the scoring feels arbitrary — the system says their prompt "lacks context" without showing what context means. Users disengage with the scoring system entirely.

**Why it happens:** Fair free-text scoring without LLM evaluation is genuinely hard. Rubric design underestimates the vocabulary variability of real users. Transparency is treated as secondary to UX cleanliness.

**Consequences:** Loss of trust in the product. Users stop trying on exercises because the outcome feels random. The core feedback loop — the most important mechanic in a skill-building app — is broken.

**Prevention:**
- Score on structural dimensions that do not depend on specific words: Does the prompt include a role? A goal? Constraints? Format instruction? These are binary, detectable patterns.
- Show the scoring breakdown immediately: "You included a goal (good). You didn't specify a format (try adding 'in bullet points'). You didn't give context (try adding who you are)."
- Display the "model prompt" after every exercise — not as "the right answer" but as "one strong version."
- Give partial credit generously. A prompt that hits 3 of 4 dimensions should feel like a win, not a near-miss.
- Never mark a prompt "wrong" without a specific, actionable explanation of why.

**Phase relevance:** Scoring engine design is a first-class technical concern, not a content afterthought. Design the rubric schema before writing lesson content.

---

## Moderate Pitfalls

---

### Pitfall 7: XP Inflation and Meaningless Rewards

**What goes wrong:** XP values are assigned arbitrarily and inflate over time. Early lessons give 10 XP; later ones give 50 XP. Users feel cheated on early progress. Or all lessons give equal XP and there is no sense of accomplishment on harder tasks.

**Prevention:** XP values must reflect exercise difficulty. Map the XP scale before building any lesson. Cap total XP per session to prevent grinding. Ensure XP has a visible purpose (levels, unlockable content) from day one, or remove it entirely until it does.

---

### Pitfall 8: PWA iOS Limitations Discovered Late

**What goes wrong:** The team builds a PWA assuming feature parity with Android. On iOS, the service worker cache is cleared after 7 days of inactivity, the 50MB cache limit breaks offline lesson storage, storage is not shared between Safari and the installed PWA, and there is no automatic "Add to Home Screen" prompt — users must discover this manually.

**Prevention:**
- Treat iOS PWA as a constrained environment from day one. Design offline storage to stay under 50MB. Show an explicit, well-designed "install" prompt in the UI rather than relying on the browser's native prompt.
- Use push notifications (available iOS 16.4+) but test registration flow on iOS specifically — it differs from Android.
- If offline lesson access is a core feature, budget a fallback: graceful degradation to a "you need to be online" screen rather than a broken blank page.

---

### Pitfall 9: State Management Complexity in Progress Tracking

**What goes wrong:** Progress tracking seems simple ("which lessons are complete") until it isn't. Partial completion states (started but not finished), offline completions that need to sync, streak calculation across timezones, lesson attempts vs. lesson passes — all of these require careful state modelling. Teams that treat progress as a simple boolean array discover mid-build that they need to refactor the entire data model.

**Prevention:**
- Design the progress data schema before writing any UI code. Define: what does "lesson complete" mean exactly? What data is needed for streak calculation? What is the offline-first sync strategy?
- Use a single source of truth (one state management layer) — do not split progress between local component state, AsyncStorage, and a remote database without a clear sync protocol.
- For offline-first apps, use a sync queue pattern: changes are written locally and queued for server sync, never sent directly.

---

### Pitfall 10: AI Content Becoming Outdated

**What goes wrong:** The curriculum teaches specific UI patterns or feature names from ChatGPT, Claude, or Gemini circa 2025. These tools update every 3-6 months. Within a year, screenshots are wrong, feature names have changed, and some lessons reference discontinued workflows.

**Why it happens:** The natural instinct is to anchor lessons to familiar, concrete tools. But "click the Custom Instructions button in ChatGPT" becomes wrong when OpenAI redesigns their UI.

**Prevention:** This is the reason PromptPlay's tool-agnostic curriculum decision is correct and must be enforced strictly. Lessons must teach principles ("give the AI a role") not tool mechanics ("click Settings > Customize ChatGPT"). The only acceptable tool references are illustrative examples, not instructional steps. Build a content audit cadence into the post-launch maintenance plan — schedule a quarterly review of any tool-specific references.

---

### Pitfall 11: Translation Quality Breaks the Learning Experience

**What goes wrong:** English lessons are machine-translated to Hebrew. Prompt engineering jargon ("few-shot prompting", "system prompt", "context window") either gets translated literally (meaningless) or left in English (inconsistent). Hebrew instructional text reads unnaturally, making exercises confusing.

**Prevention:**
- Maintain a glossary of AI terms with explicit decisions: translate, transliterate, or leave in English. Example: "system prompt" might become "הנחיית מערכת" (translated) or "סיסטם פרומפט" (transliterated) — pick one and use it everywhere.
- Hebrew content must be written natively or reviewed by a fluent speaker, not auto-translated.
- Mixed-language text (Hebrew sentence with embedded English term) is acceptable and expected — but must use `dir="auto"` or explicit `<bdi>` wrapping to prevent layout issues.

---

## Minor Pitfalls

---

### Pitfall 12: Skill Tree Scope Creep

**What goes wrong:** The skill tree is designed to show "the whole learning journey," which leads to pre-building 50+ lesson slots before validating that users engage with the first 10. The team spends months on content that never gets used.

**Prevention:** Ship with exactly the first path fully built (20-30 lessons). Show placeholder locked nodes to indicate future content, but do not build them. Validate that users reach lesson 20 before designing lesson 21.

---

### Pitfall 13: Reward Fatigue from Celebration Overload

**What goes wrong:** Every exercise completion triggers a confetti animation, a sound, and an XP popup. By lesson 5, the user taps dismiss before the animation finishes. By lesson 10, the reward feels like an obstacle.

**Prevention:** Reserve celebrations for meaningful milestones: lesson completion, level-up, streak milestone, skill tree node unlock. Individual exercise completion should have a subtle, fast feedback animation (checkmark, brief colour change) not a full celebration sequence.

---

### Pitfall 14: Animation Performance on Low-End Android

**What goes wrong:** Confetti animations, card flip transitions, and progress bar fills run at 60fps on the developer's iPhone 16 and at 15fps on a $120 Android device. The gamification layer that was meant to delight users creates frustration on the hardware most beginners are likely to own.

**Prevention:**
- Animate only non-layout properties: `transform`, `opacity`. Never animate `width`, `height`, `top`, `left` — these trigger layout recalculation on every frame.
- Use Reanimated (React Native) with worklets to run animations on the UI thread, not the JS thread.
- Cap simultaneous animated elements: do not render more than 10-15 animated elements at once.
- Test on a low-end Android device (2GB RAM, budget chipset) as part of the standard dev loop, not just before release.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Architecture setup | RTL bolted on late | Use logical CSS properties from line 1; test Hebrew locale after every component |
| Content design | Shallow lessons, wrong difficulty curve | Define Day 0 user state; require "one transferable insight" per lesson |
| Gamification system | Over-gamification, loss-aversion mechanics | No guilt-based notifications; reward milestones not participation |
| Scoring engine | Opaque or unfair scoring | Design rubric schema before content; show breakdown and model prompt always |
| First lesson | Tutorial island, no first-session value | User in first exercise within 60 seconds; demo before orientation |
| PWA/platform | iOS cache eviction, no install prompt | Design for 50MB limit; explicit iOS install UX |
| Progress tracking | State management complexity | Design data schema before UI; define "lesson complete" precisely |
| Hebrew localisation | Translation quality, mixed-direction bugs | Native review; maintain AI term glossary; use `<bdi>` for inline English terms |
| Post-launch | AI tool content drift | No tool-specific instructions; quarterly content audit |
| Growth phase | Scope creep on skill tree | Build only what users will reach; locked placeholders for future content |

---

## Sources

- [Duolingo's Shallow Learning Trap — DEV Community](https://dev.to/yaptech/duolingos-shallow-learning-trap-gamified-streaks-harmful-habits-4134)
- [When Gamification Spoils Your Learning — arXiv (peer-reviewed)](https://arxiv.org/pdf/2203.16175)
- [Right to Left in React: The Developer's Guide — LeanCode](https://leancode.co/blog/right-to-left-in-react)
- [PWA iOS Limitations and Safari Support 2026 — MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)
- [PWA on iOS — Current Status & Limitations 2025 — Brainhub](https://brainhub.eu/library/pwa-on-ios)
- [React Native State Management Pitfalls — The One Technologies](https://theonetechnologies.com/blog/post/optimizing-state-management-in-react-native-pitfalls-and-best-practices)
- [React Native Offline First App Development — Relevant Software](https://relevant.software/blog/react-native-offline-first/)
- [Performance — React Native Reanimated Official Docs](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/)
- [Mobile App Retention Rate Stats 2024 — NudgeNow](https://www.nudgenow.com/blogs/mobile-app-retention-rate)
- [Mobile App Onboarding Best Practices — Appcues](https://www.appcues.com/blog/mobile-onboarding-best-practices)
- [Gamification Trends 2025 — EI Design](https://www.eidesign.net/gamification-trends-in-2025-packed-with-tips-and-ideas-you-can-use/)
- [Duolingo Gamification Secrets — Orizon](https://www.orizon.co/blog/duolingos-gamification-secrets)
