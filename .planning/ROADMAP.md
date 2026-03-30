# Roadmap: PromptPlay

## Milestones

- ✅ **v2.0 Web-First Rebuild** - Phases 1-14 (shipped 2026-03-29)
- 🚧 **v2.1 Practical AI & Sandbox** - Phases 15-18 (in progress)

## Phases

<details>
<summary>✅ v2.0 Web-First Rebuild (Phases 1-14) - SHIPPED 2026-03-29</summary>

Phases 1-14 completed. See git history for details.

</details>

### 🚧 v2.1 Practical AI & Sandbox (In Progress)

**Milestone Goal:** Add Chapter 5 (AI for Code & Automation) with 5 practical lessons and a freeform Practice Sandbox for post-completion retention.

- [ ] **Phase 15: CodeBlock Foundation + Schema Extension** - RTL-safe code display component and content schema extension
- [ ] **Phase 16: Chapter 5 Content Pipeline** - 5 lesson JSON files for AI for Code & Automation
- [ ] **Phase 17: Code Exercise Display Integration** - Wire code display into lessons with syntax highlighting
- [ ] **Phase 18: Practice Sandbox** - Freeform simulated prompting area with scenario templates

## Phase Details

### Phase 15: CodeBlock Foundation + Schema Extension
**Goal**: Code content can be safely displayed in both English and Hebrew without RTL bidi corruption
**Depends on**: Phase 14
**Requirements**: INFRA-01, INFRA-02
**Success Criteria** (what must be TRUE):
  1. A code snippet rendered in Hebrew mode displays left-to-right with no character reversal or bidi corruption
  2. The CodeBlock component enforces `dir="ltr"` unconditionally — no caller can accidentally omit it
  3. Existing lesson JSON files pass `tsc --noEmit` after schema extension (no regressions)
  4. New optional fields (`codeLanguage`, `starterCode`) are accepted by the content schema without breaking current lessons
**Plans**: TBD
**UI hint**: yes

### Phase 16: Chapter 5 Content Pipeline
**Goal**: Users can access and complete all 5 lessons in Chapter 5: AI for Code & Automation
**Depends on**: Phase 15
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05
**Success Criteria** (what must be TRUE):
  1. User can navigate to and complete Lesson 21 — Intro to AI-Assisted Coding
  2. User can navigate to and complete Lesson 22 — Writing Your First Script with AI
  3. User can navigate to and complete Lesson 23 — Debugging with AI
  4. User can navigate to and complete Lesson 24 — Automating Repetitive Tasks
  5. User can navigate to and complete Lesson 25 — Putting It Together
**Plans**: TBD

### Phase 17: Code Exercise Display Integration
**Goal**: Chapter 5 exercises render code snippets with syntax highlighting inside lesson flows
**Depends on**: Phase 16
**Requirements**: CONT-06
**Success Criteria** (what must be TRUE):
  1. Code snippets in Chapter 5 exercises display in a monospace block with visual distinction from prose
  2. Code blocks in Hebrew mode remain left-to-right and readable
  3. At least one exercise per code lesson shows a code snippet in the exercise body
**Plans**: TBD
**UI hint**: yes

### Phase 18: Practice Sandbox
**Goal**: Users can practice freeform AI prompting with simulated responses after completing lessons
**Depends on**: Phase 17
**Requirements**: SAND-01, SAND-02, SAND-03, SAND-04
**Success Criteria** (what must be TRUE):
  1. User can navigate to Practice Sandbox from the main navigation
  2. User can select from pre-built coding scenario templates
  3. User can type a freeform prompt and submit it
  4. Sandbox displays a simulated AI response matched to the selected scenario and prompt content
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-14. v2.0 Phases | v2.0 | - | Complete | 2026-03-29 |
| 15. CodeBlock Foundation + Schema Extension | v2.1 | 0/TBD | Not started | - |
| 16. Chapter 5 Content Pipeline | v2.1 | 0/TBD | Not started | - |
| 17. Code Exercise Display Integration | v2.1 | 0/TBD | Not started | - |
| 18. Practice Sandbox | v2.1 | 0/TBD | Not started | - |
