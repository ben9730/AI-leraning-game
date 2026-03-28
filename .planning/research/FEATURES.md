# Feature Landscape: PromptPlay

**Domain:** Gamified AI literacy / prompting skills learning app
**Researched:** 2026-03-28
**Overall confidence:** HIGH (Duolingo mechanics), MEDIUM (AI curriculum topics), MEDIUM (simulated scoring)

---

## Table Stakes

Features users expect from a Duolingo-style learning app. Missing any of these = product feels incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Daily streak tracking | Core Duolingo expectation; drives habit | Low | Show flame icon + day count prominently |
| XP points per lesson | Immediate reward signal | Low | Award on lesson complete + per exercise |
| Progress bar in lessons | Users need to know how far they are | Low | "Exercise 3 of 5" style |
| Level/tier system | Sense of advancement beyond individual lessons | Low | Unlocks visual rewards |
| Correct/incorrect feedback | Immediate per-answer feedback | Low | Green/red + explanation, not just right/wrong |
| Lesson completion celebration | Dopamine hit at end of lesson | Low | Animation + XP awarded screen |
| Learning path / skill tree | Users must see the full journey | Medium | Linear path for v1, branch later |
| Onboarding flow | First-run experience sets retention | Medium | Goal setting + first lesson immediately |
| Daily goal setting | Users choose own pace (5 / 10 / 15 min) | Low | Affects XP targets, not content |
| Streak freeze / recovery | Prevent churn when streak breaks | Low | One free freeze, warn before midnight |
| Lesson review / retry | Users want to replay lessons | Low | Track best score per lesson |
| RTL layout (Hebrew) | First-class requirement from PROJECT.md | High | Architecture-level, not a skin |

---

## Differentiators

Features that separate PromptPlay from generic quiz apps and make it feel purpose-built.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Simulated AI response pane | Users see "AI" respond to their prompt in real-time (scripted) | Medium | The core novel interaction; sells the concept |
| Prompt quality scoring rubric | Scores prompts on Clarity, Specificity, Context, Intent | Medium | Keyword/pattern matching against model answers |
| Prompt comparison exercise | Show two prompts side-by-side, pick the better one + why | Low | High learning value, low implementation cost |
| Prompt fix / debug exercise | Show a bad prompt, ask user to improve it | Medium | Teaches iteration — a core prompting skill |
| "What went wrong" feedback | Explain WHY a prompt scored low, not just the score | Medium | Turns failure into a lesson |
| Tool-agnostic framing | Every lesson explicitly says "works in ChatGPT, Claude, Gemini…" | Low | Pure content decision, high perceived value |
| Before/after prompt examples | Show same task with bad vs good prompt, real output diff | Low | Compelling without any API calls |
| Mascot / tone | Friendly, non-judgmental voice (like Duo the owl) | Low | Content/copy decision; reduces intimidation |

---

## Anti-Features

Features to explicitly NOT build in v1 (and why).

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Hearts / energy gate | #1 Duolingo complaint in 2025 — limits learning, triggers rage-quit. Energy bar backlash drew 3,000+ upvotes on Reddit | Allow unlimited attempts; use XP bonus for perfect runs instead |
| Aggressive push notifications | Duolingo's "how do you say quitter in Italian?" was widely called bullying | Opt-in reminders with friendly, low-pressure copy |
| Leaderboards (v1) | Explicitly out of scope per PROJECT.md; adds social complexity | Add in v2 if retention data supports it |
| Paywall mid-lesson | Users hate being blocked from content mid-flow | Freemium gate at lesson boundaries only, if ever |
| Real AI API calls | Zero marginal cost is a hard constraint (PROJECT.md) | Pre-scripted responses with pattern-match scoring |
| AI-generated course content | Duolingo lost trust replacing human authors with AI | Hand-craft every lesson; quality over quantity |
| Video content | Production overhead; not needed to validate | Text + interactive exercises sufficient for v1 |
| Multiple learning paths | Validate one path first (PROJECT.md) | Single linear path, branch in v2 |

---

## Gamification Mechanics: Impact vs. Implementation

Ranked by evidence-backed impact relative to effort required.

| Mechanic | Impact | Effort | v1? | Evidence |
|----------|--------|--------|-----|----------|
| Daily streak | Very High | Low | YES | 7-day streak = 3.6x retention lift (Duolingo data) |
| XP per exercise/lesson | High | Low | YES | Immediate feedback loop; standard expectation |
| Streak freeze | High | Low | YES | Reduced churn 21% for at-risk users (Duolingo) |
| Lesson completion animation | High | Low | YES | Dopamine signal; trivial to implement |
| Level/tier progression | Medium | Low | YES | Unlocks sense of mastery |
| Daily XP goal | Medium | Low | YES | Self-set pace; users 40% more likely to return |
| Achievement badges | Medium | Medium | YES (3-5) | Only meaningful badges, not badge inflation |
| Streak repair (missed day) | Medium | Low | YES | Show "repair" option with gems cost |
| Leaderboards / leagues | High | High | NO | Adds social infra; validated v2 feature |
| Gems / virtual currency | Medium | Medium | DEFER | Only useful if there's a store to spend them |
| XP boosts / powerups | Low | Medium | NO | Adds monetization complexity before model is set |

**v1 Gamification Stack:** Streak + Freeze + XP + Daily Goal + Levels + 3-5 Badges + Completion Animations

---

## Exercise Types for AI Prompting

Mapped to learning objectives. Each lesson (2-3 exercises) should use varied types.

| Exercise Type | Learning Objective | Implementation | Difficulty to Build |
|---------------|-------------------|----------------|---------------------|
| Multiple choice — concept | Test understanding of prompting principles | Standard quiz | Low |
| Pick the better prompt | Compare two prompts, choose the stronger one | Two-panel UI, reveal explanation | Low |
| Fill-in-the-blank | Complete a partial prompt with correct element | Text input, keyword match | Low |
| Rewrite the bad prompt | Given a vague prompt, improve it | Free text + rubric scoring | Medium |
| Match output to prompt | Given a prompt, pick which AI output it would produce | Multiple choice variant | Low |
| Prompt builder (drag-and-drop) | Assemble a well-structured prompt from components | Drag/drop UI | Medium |
| Simulated AI chat | Write a prompt, see pre-scripted AI response, score it | Core exercise type; scripted response lookup | Medium |
| Spot the problem | Identify what's wrong with a given prompt | Highlight/tap the issue | Low |
| Free-text prompt challenge | Open-ended prompt, scored against rubric | Rubric scoring required | Medium |

**Recommended v1 mix:** 40% multiple choice (concept + output matching), 30% rewrite/fix exercises, 30% simulated AI interaction. Avoid over-indexing on free-text early — it's harder to score and can frustrate beginners.

---

## Scoring Approach for Simulated Prompts

Since there is no live API, prompt scoring must be deterministic and pre-built. Two viable approaches:

### Approach A: Rubric Keyword Matching (Recommended for v1)
Each exercise has a model answer with required keywords/phrases and optional bonus elements.

**Scoring dimensions** (each 0-25 pts = 100 pt max):
1. **Clarity** — Does the prompt state what it wants clearly? (Detects: vague words like "stuff", "things", "help me")
2. **Specificity** — Does the prompt include concrete details? (Detects: numbers, names, formats, examples)
3. **Context** — Does the prompt provide relevant background? (Detects: role, audience, purpose indicators)
4. **Intent / Output format** — Does the prompt specify what form the answer should take? (Detects: "as a list", "in 3 sentences", "step by step")

**Implementation:** Each exercise defines:
- `required_keywords[]` — must contain these (exact or fuzzy match)
- `penalty_phrases[]` — phrases that indicate vagueness
- `bonus_keywords[]` — optional elements that boost score
- `model_answer` — shown after submission as the "ideal" example

**Scoring feedback:** Never just a number. Always: "Your prompt was clear but lacked specificity. Adding [example] would improve it."

### Approach B: Template Pattern Match (Simpler)
Binary pass/fail per criterion. User sees checklist: "Did you include a role? Did you specify format?" Simpler to build, less nuanced.

**Recommendation:** Start with Approach B for first 5 lessons (simpler, less anxiety), graduate to Approach A from lesson 6 onward as users have learned the rubric.

---

## Curriculum Outline: 20-30 Lesson Path

**Structure:** 5 chapters × 4-6 lessons each. Each lesson = 30-sec intro + 2-3 exercises + completion screen.

### Chapter 1: What Is AI? (Lessons 1-4)
Foundation concepts. Build comfort, reduce intimidation.

| # | Title | Key Concept | Exercise Types |
|---|-------|-------------|----------------|
| 1 | Meet Your AI | AI as a collaborative tool, not magic | Concept MC, pick better prompt (friendly vs. cold) |
| 2 | How AI Understands You | Input → Output model; AI has no context by default | Fill-in-the-blank, output matching |
| 3 | What AI Is Good At | Strengths: drafting, summarizing, brainstorming | Scenario matching |
| 4 | What AI Gets Wrong | Hallucinations, limits, need to verify | Spot the problem |

### Chapter 2: The Building Blocks of a Good Prompt (Lessons 5-9)
Introduce the 4-dimension rubric one element at a time.

| # | Title | Key Concept | Exercise Types |
|---|-------|-------------|----------------|
| 5 | Be Clear | Clarity: say exactly what you want | Rewrite vague prompt |
| 6 | Be Specific | Specificity: add details (who, what, how long, what format) | Fill-in-the-blank, compare prompts |
| 7 | Give Context | Context: tell AI your situation or role | Simulated AI chat |
| 8 | Set the Format | Output format: list, paragraph, table, step-by-step | Output matching, prompt builder |
| 9 | Put It Together | Combine all 4 elements in one prompt | Free-text challenge (graded) |

### Chapter 3: Everyday AI Tasks (Lessons 10-14)
Apply the building blocks to real-world scenarios.

| # | Title | Key Concept | Exercise Types |
|---|-------|-------------|----------------|
| 10 | Writing Help | Drafting emails, messages, documents | Simulated AI chat |
| 11 | Summarizing | Condense long content into key points | Prompt comparison |
| 12 | Brainstorming | Generate ideas with AI | Rewrite exercise |
| 13 | Explaining Complex Topics | Ask AI to explain things simply | Prompt fix |
| 14 | Research Assistance | Using AI to find, not verify, information | Spot-the-problem + concept MC |

### Chapter 4: Leveling Up (Lessons 15-20)
Intermediate techniques: iteration, roles, constraints.

| # | Title | Key Concept | Exercise Types |
|---|-------|-------------|----------------|
| 15 | The Follow-Up | Iteration: refine AI output with follow-up prompts | Multi-turn simulated chat |
| 16 | Give AI a Role | "Act as a [role]" technique | Compare prompts |
| 17 | Set Constraints | Word limits, tone, audience parameters | Prompt builder |
| 18 | Few-Shot Prompting | Teach by example: "Here's what I want, like this…" | Fill-in-the-blank |
| 19 | Chain of Thought | Ask AI to show its reasoning | Concept MC + simulated chat |
| 20 | Debugging Bad Output | When AI gives wrong answer: how to fix it | Prompt fix exercise |

### Chapter 5: Real-World Mastery (Lessons 21-26)
Advanced scenarios. Graduation chapter.

| # | Title | Key Concept | Exercise Types |
|---|-------|-------------|----------------|
| 21 | Work & Productivity | Professional prompting: reports, plans | Free-text challenge |
| 22 | Learning with AI | Use AI as a tutor, not an answer machine | Prompt comparison |
| 23 | Creative Projects | Prompting for creative writing, ideation | Simulated AI chat |
| 24 | Coding Assistance (Light) | Even non-coders can use AI for scripts | Rewrite exercise |
| 25 | Sensitive Topics | What not to ask; ethical use | Spot-the-problem, concept MC |
| 26 | Your Prompt Toolkit | Review: assemble personal prompt library | Free-text challenge (capstone) |

**Total: 26 lessons.** Achievable in 2-3 weeks at 1 lesson/day; completable in a weekend for motivated users.

---

## Onboarding Flow

Based on Duolingo's approach (improved Day-1 retention from 13% to 55% through onboarding optimization):

**Step 1 — Goal Setting (30 sec)**
"How much time do you want to spend each day?"
- 5 min (Casual) / 10 min (Regular) / 15 min (Serious)
- Sets daily XP target. No skill assessment — don't gatekeep beginners.

**Step 2 — First Lesson Immediately**
No account creation wall. Launch Lesson 1 immediately after goal setting.
- Account creation deferred until lesson 1 completion ("Save your progress?")
- This is the proven pattern: Duolingo's biggest retention lift came from removing the signup wall before first lesson.

**Step 3 — Instant Win**
Lesson 1 is intentionally easy (5 questions, all answerable by intuition).
- User finishes, sees XP + "1-day streak started!" celebration.
- Then: "Create account to keep your streak."

**Step 4 — Streak Commitment**
After account creation: "Set a reminder so you don't lose your streak."
- Opt-in notification prompt, not forced.

---

## Engagement Hooks

| Hook | Mechanism | Implementation | Priority |
|------|-----------|----------------|----------|
| Streak reminder notification | "Don't lose your X-day streak!" at user's preferred time | Push notification (PWA: web push) | High |
| Midnight streak warning | 2-hour warning before streak expires | Scheduled push | High |
| Streak freeze auto-offer | When user hasn't done lesson by 8pm, offer freeze | Triggered push | Medium |
| XP celebration animation | Confetti / character animation on lesson complete | Lottie animation | High |
| Level-up screen | Full-screen celebration when reaching new level | One-time modal | Medium |
| Badge unlock | Notification + animation when badge earned | Push + in-app | Low |
| Weekly summary | "You learned X things this week!" on Sunday | Weekly push | Low |
| Comeback message | Friendly (not shaming) message after 2+ day gap | Push notification | Medium |

**Notification tone:** Encouraging, never shaming. Never "You failed." Always "Your streak is waiting!" Avoid Duolingo's widely criticized aggressive/guilt-trip notifications.

---

## Feature Dependencies

```
Account/Auth → Streak tracking → Streak freeze
Account/Auth → XP persistence → Level system
Lesson engine → Exercise types → Scoring rubric
Scoring rubric → Simulated AI response → Feedback messages
Daily goal → Push notifications → Streak reminders
Skill tree UI → Lesson completion state → Progress persistence
RTL support → Layout system → All content screens
```

---

## MVP Recommendation

**Build first (v1 core):**
1. Lesson engine with 3 exercise types: multiple choice, rewrite prompt, simulated AI chat
2. Rubric scoring (Approach B: checklist) for free-text exercises
3. XP + streak + streak freeze (the highest-ROI gamification trio)
4. Skill tree showing all 26 lessons (locked/unlocked state)
5. Chapters 1-2 (Lessons 1-9) fully authored — enough to validate engagement
6. Onboarding: goal setting → instant Lesson 1 → deferred signup

**Defer to v2:**
- Leaderboards/leagues — validates after core retention proven
- Gems/virtual currency — only useful with a store
- Lessons 21-26 (Chapter 5) — release after validating Chapters 1-4 completion rate
- Native app store deployment — PWA first

---

## Sources

- [Duolingo Gamification Secrets — Orizon](https://www.orizon.co/blog/duolingos-gamification-secrets)
- [How Duolingo Reignited User Growth — Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)
- [Duolingo Gamification Case Study — Trophy](https://trophy.so/blog/duolingo-gamification-case-study)
- [Duolingo Uses Gaming Principles — Deconstructor of Fun](https://www.deconstructoroffun.com/blog/2025/4/14/duolingo-how-the-15b-app-uses-gaming-principles-to-supercharge-dau-growth)
- [Duolingo Energy Update Backlash — Top Tech Guides](https://toptechguides.com/duolingo-energy-update-backlash/)
- [Why Users Hate the New Duolingo — Duolingo Guides](https://duolingoguides.com/i-hate-the-new-duolingo/)
- [Duolingo Push Notification Strategy — Ngrow](https://www.ngrow.ai/blog/decoding-duolingo-analyzing-the-effectiveness-of-their-push-notification-strategy)
- [Duolingo Streak System Breakdown — Medium](https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f)
- [Gamification in Learning 2025 — eLearning Industry](https://elearningindustry.com/gamification-in-learning-enhancing-engagement-and-retention-in-2025)
- [Onboarding Gamification Examples — Userpilot](https://userpilot.com/blog/onboarding-gamification/)
- [Prompt Engineering Guide — IBM](https://www.ibm.com/think/prompt-engineering)
- [Learn Prompting — learnprompting.org](https://learnprompting.org/)
- [Complete Guide to Prompt Engineering 2025 — DEV Community](https://dev.to/fonyuygita/the-complete-guide-to-prompt-engineering-in-2025-master-the-art-of-ai-communication-4n30)
- [Measuring Prompt Quality Rubrics — EHGA](https://ehga.org/measuring-prompt-quality-rubrics-for-completeness-and-clarity)
- [Mimo Coding App Structure — Mimo](https://mimo.org/mimo-coding-app)
