# PromptPlay — AI Skills Learning App

## What This Is

A Duolingo-style gamified mobile app that teaches beginners how to get great results from AI tools. Users progress through bite-sized lessons and fun practice exercises, learning universal prompting skills that work across ChatGPT, Claude, Gemini, and any AI tool. Pre-built simulated AI interactions keep costs at zero while providing a controlled, polished learning experience.

## Core Value

Make AI skills accessible and fun for anyone — turn "I don't know what to ask AI" into confident, effective AI usage through gamified practice.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Gamification system — XP points, daily streaks, levels, progress tracking
- [ ] One complete learning path (~20-30 lessons) from AI basics to intermediate prompting
- [ ] Mini-lesson format — short explanations (30 sec read) followed by 2-3 practice exercises
- [ ] Pre-built/simulated AI practice — users write prompts, see pre-scripted AI responses, get scored on technique
- [ ] Mobile-first responsive design
- [ ] English + Hebrew language support (RTL layout support)
- [ ] Skill tree / progression map showing learning journey
- [ ] Lesson types: read + practice, prompt challenges, quizzes to keep engagement varied
- [ ] Tool-agnostic curriculum — teaches universal prompting principles, not specific tool UIs

### Out of Scope

- Real AI API integration (no live API calls) — keeps costs zero, full control over experience
- Multiple learning paths / tracks (v1 is one path) — defer to v2 after validating single path works
- Leaderboards / social features — adds complexity, not needed to validate core value
- Video content — adds production overhead, text + interactive is sufficient for v1
- Monetization system — figure out model after proving engagement
- Native app store deployment (v1) — start as web/PWA, go native after validation

## Context

- **Market opportunity**: No dominant "Duolingo for AI" exists. 200M+ weekly ChatGPT users are self-teaching through trial and error. 60-70% of workers feel undertrained on AI.
- **Inspiration**: Duolingo's engagement model — daily streaks, XP, bite-sized sessions, fun tone. Apply to AI education.
- **User pain points**: People don't know what AI can do, write vague prompts, and don't know how to iterate. They need structured, progressive skill-building.
- **Content approach**: Pre-built scenarios with expected inputs/outputs. Each exercise has a "model prompt" and scoring rubric evaluating clarity, specificity, context, and intent.
- **Language**: English + Hebrew from day one. RTL support is a first-class requirement.
- **Origin**: Friend struggles to get good results from AI — sparked the idea that millions share this problem.

## Constraints

- **Cost**: No per-user API costs — all AI interactions are simulated/pre-built
- **Platform**: Mobile-first, but tech stack TBD via research (React Native, Flutter, PWA, etc.)
- **Content scope**: V1 covers one learning path only — depth over breadth
- **Bilingual**: Must support RTL (Hebrew) from the architecture level, not bolted on later

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Simulated AI (no live API) | Zero marginal cost, full control over learning experience, consistent for all users | — Pending |
| Tool-agnostic curriculum | Universal skills are more valuable than tool-specific tutorials; tools change, principles don't | — Pending |
| Duolingo-style gamification | Proven engagement model, familiar to users, drives daily habit formation | — Pending |
| English + Hebrew from day one | Bilingual from start avoids costly RTL retrofit later | — Pending |
| One learning path for v1 | Validate engagement with one great path before expanding | — Pending |
| Tech stack via research | Let domain research inform the best choice rather than assuming | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after initialization*
