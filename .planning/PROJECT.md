# PromptPlay — AI Skills Learning App

## What This Is

A Duolingo-style gamified mobile app that teaches beginners how to get great results from AI tools. Users progress through bite-sized lessons and fun practice exercises, learning universal prompting skills that work across ChatGPT, Claude, Gemini, and any AI tool. Pre-built simulated AI interactions keep costs at zero while providing a controlled, polished learning experience.

## Core Value

Make AI skills accessible and fun for anyone — turn "I don't know what to ask AI" into confident, effective AI usage through gamified practice.

## Requirements

### Validated

- ✓ Gamification system — XP points, daily streaks, levels, progress tracking — v2.0
- ✓ One complete learning path (20 lessons across 4 chapters) — v2.0
- ✓ Mini-lesson format — intro → exercises → completion with XP/badges — v2.0
- ✓ Pre-built/simulated AI practice — 6 exercise types with scoring evaluators — v2.0
- ✓ Mobile-first responsive design with desktop sidebar at lg+ — v2.0
- ✓ English + Hebrew language support with instant RTL flip — v2.0
- ✓ Skill tree / progression map with chapter-grouped nodes — v2.0
- ✓ Lesson types: MCQ, pick-better, free-text, fill-blank, spot-problem, simulated-chat — v2.0
- ✓ Tool-agnostic curriculum — universal prompting principles — v2.0

### Active

- [ ] Chapter 5: AI for Code & Automation — 5 practical lessons
- [ ] Practice Sandbox — Simulated freeform prompting area with scenario templates
- [ ] Content pipeline extension — New lessons in skill tree, progression, chapter system

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
- **Platform**: Web-first PWA (Vite + React), installable on mobile home screens
- **Content scope**: V1 covers one learning path only — depth over breadth
- **Bilingual**: Must support RTL (Hebrew) from the architecture level, not bolted on later

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Simulated AI (no live API) | Zero marginal cost, full control over learning experience, consistent for all users | ✓ Good |
| Tool-agnostic curriculum | Universal skills are more valuable than tool-specific tutorials; tools change, principles don't | ✓ Good |
| Duolingo-style gamification | Proven engagement model, familiar to users, drives daily habit formation | ✓ Good |
| English + Hebrew from day one | Bilingual from start avoids costly RTL retrofit later | ✓ Good |
| One learning path for v1 | Validate engagement with one great path before expanding | ✓ Good |
| Vite 6 + React 19 + Tailwind v4 | Research-driven: fastest DX, modern stack, no SSR overhead for SPA | ✓ Good |
| Web-first rebuild (v2.0) | Expo/React Native web support is too broken — pure TS game logic is portable | ✓ Good |
| Shared monorepo (npm workspaces) | Portable TS logic in shared/, web app in web/ — future native wrapper possible | ✓ Good |
| Workbox via vite-plugin-pwa | PWA offline support with precaching, prompt-based update strategy | ✓ Good |

## Current Milestone: v2.1 Practical AI & Sandbox

**Goal:** Add a code & automation chapter with 5 practical lessons plus a freeform practice sandbox for post-completion retention.

**Target features:**
- Chapter 5: AI for Code & Automation — 5 new lessons (writing scripts, debugging, automation)
- Practice Sandbox — Simulated freeform area with scenario templates, unlocked post-completion
- Content pipeline extension — New lessons integrate into chapter/lesson/skill-tree system

## Previous State: v2.0 Shipped

**Shipped:** 2026-03-29
**Stack:** Vite 6 + React 19 + Tailwind v4 + Zustand + Workbox
**Codebase:** 81 TS/TSX files, 6,517 LOC across shared/ and web/

PromptPlay v2.0 is a fully functional web app with:
- 20 lessons across 4 chapters with 6 exercise types
- XP, streaks, levels, badges, celebrations
- Visual skill tree with chapter completion tracking
- EN/HE with instant RTL layout flip
- PWA with offline support, install prompts, responsive desktop/mobile layout
- SEO meta tags and Open Graph cards for social sharing

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
*Last updated: 2026-03-30 after v2.1 milestone kickoff*
