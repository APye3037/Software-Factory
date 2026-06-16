# Software factory — project conventions

This repo uses a chain of specialised subagents (see `.claude/agents/`). The rules
below apply to ALL development work, whether run via `/feature` or by hand.

## The pipeline (never skip a step)
1. **codebase-researcher** — runs first on every feature or bug, before design or code.
2. **story-writer** — defines the user story.  → **HUMAN GATE 1**: you approve the story.
3. **spec-writer** — writes the technical brief.  → **HUMAN GATE 2**: you approve the brief.
4. **backend-builder** — backend only.
5. **frontend-builder** — frontend only; consumes the backend's API contract.
6. **test-verifier** — acceptance tests against the story.
7. **implementation-validator** — independent, read-only review.

## Hard rules
- Never write or edit application code until BOTH gates are approved. If I haven't said
  "approved", stop and wait.
- The planning and review agents (researcher, story-writer, spec-writer, validator) are
  read-only by design. Do not give them edit power.
- Backend and frontend builders stay in their own folders and never touch each other's.
- Every build agent runs typecheck, lint, and tests before finishing.

## Project specifics — FILL THESE IN for your repo
- Backend folders:   </server>
- Frontend folders:  </app>
- Test command:      <test agents>
- Typecheck command: <npm run typecheck>
- Lint command:      <npm run lint>
- Stack & key conventions: Node + Express + Postgres; React + Vite; Vitest
