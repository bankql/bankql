---
name: wrap-it-up
description: Pre-merge checklist for feature branches — run this before opening a PR. Covers three areas in order: (1) run existing tests to surface regressions, (2) check coverage on new code and write missing tests, (3) fix type safety issues (no `any`/`unknown`/`Record<string,any>`) and update CLAUDE.md/rules files to reflect what changed. Use this whenever a feature feels done and it's time to prepare for review — even if the user just says "ready to PR", "this is done", "let's open a PR", or "clean this up before I share it".
---

# Wrap It Up

Pre-merge hygiene for feature branches. Work through these three phases in order. The goal is a PR that's clean, well-tested, correctly typed, and documented before anyone else sees it.

Everything is scoped to the current branch diff. Don't touch files that weren't changed.

---

## Phase 0: Understand what changed

Start here — everything else is scoped to this.

```bash
git diff main...HEAD --name-only   # which files changed
git diff main...HEAD               # full diff — read this carefully
```

From the diff, identify:

- What new functionality was added
- Which workspaces are affected (`web`, `azf-v1`, `azf-df`, `etl`, `schema`, `ui`)
- Which CLAUDE.md and `.claude/rules/` files are likely relevant

---

## Phase 1: Tests

### 1a. Run existing tests — surface regressions, don't fix them

Run tests for each affected workspace only:

```bash
npx vitest run -w @bankql/web
npx vitest run -w @bankql/azf-v1
npx vitest run -w @bankql/azf-df
npx vitest run -w @bankql/etl
npx vitest run -w @bankql/schema
npx vitest run -w @bankql/ui
```

**If a test fails:** Stop. Don't modify the test. The test is telling you something about the production code. Read what the test asserts, understand what it expects, and surface it clearly to the user — what the test expects vs. what it actually gets. The user decides whether to fix the code or update the test intentionally. Your job is to make the problem visible, not make it go away.

### 1b. Check coverage on new code

Run coverage for affected workspaces:

```bash
npx vitest run --coverage -w @bankql/schema
# add other workspaces once they have tests wired up
```

Cross-reference coverage output against the diff. For each new function, class, or branch in the diff:

- Is it covered?
- If not, write a test.

Prioritize writing tests for:

- Business logic: handlers, services, utilities
- Error paths and edge cases
- Any exported function with more than one code path

Skip tests for:

- Pure type definitions
- Re-exports and barrel files
- Configuration objects with no logic

Match the patterns in existing `*.test.ts` files in the same workspace. Use what's already there — don't invent new test utilities.

---

## Phase 2: Type Safety

Scan only the changed files.

Find and fix:

- `: any` type annotations, `as any` casts, `Array<any>`, `Promise<any>`
- `unknown` used without narrowing — if a value is typed `unknown`, it must be narrowed before use
- `Record<string, any>` or `{ [key: string]: any }` — replace with a concrete shape, or `Record<string, unknown>` plus a narrowing guard
- Type assertions (`as Foo`) that paper over a mismatch rather than properly narrowing
- Missing return types on exported functions

Fix the actual type, not the symptom. If something is typed `any` because the real shape was unclear, read the code and determine the real shape. Swapping `any` for `unknown` without adding a narrowing guard is not a fix.

---

## Phase 3: Documentation

Look at which CLAUDE.md and `.claude/rules/` files cover the areas touched by the diff. Update them to reflect:

- New patterns established by this change
- New files or modules that others should know about
- Changed behavior that contradicts existing guidance
- Edge cases or gotchas discovered during this work

Files that may need updating:

- `CLAUDE.md` (root)
- `.claude/rules/start-here.md`
- Any workspace-level `CLAUDE.md` that exists in the touched workspace

Only add content that genuinely helps someone working in that area. Don't pad.

---

## Wrap-Up Report

When all three phases are done, produce this summary:

```
## Wrap-It-Up Summary

### Tests
- Existing tests: pass / failing: <list with description>
- New tests written: <list — what each covers>

### Types
- Issues fixed: <list of files + what changed> / none found

### Docs updated
- CLAUDE.md / rules: <list of files changed, or "none needed">

### Needs your attention
<anything that requires human judgment: failing tests, architectural questions, intentional type workarounds>
```

---

## Scope notes

- All checks are scoped to `git diff main...HEAD --name-only`
- Only run tests for workspaces that have changed files and have `test` scripts wired up
