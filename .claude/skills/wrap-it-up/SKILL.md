---
name: wrap-it-up
description: Pre-merge checklist for feature branches — run this before opening a PR. Covers four areas in order: (1) run existing tests to surface regressions, (2) check coverage on new code and write missing tests, (3) fix type safety issues (no `any`/`unknown`/`Record<string,any>`), verify HTTP handlers have response `satisfies` schemas and real permissions (not `TOKEN_VALIDATION_ONLY`), (4) update wiki and CLAUDE.md/rules files to reflect what changed. Use this whenever a feature feels done and it's time to prepare for review — even if the user just says "ready to PR", "this is done", "let's open a PR", or "clean this up before I share it".
---

# Wrap It Up

Pre-merge hygiene for feature branches. Work through these four phases in order. The goal is a PR that's clean, well-tested, correctly typed, and documented before anyone else sees it.

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
- Which workspaces are affected (`web`, `functions`, `durable-functions`, `schemas`, `functions-shared`)
- Which wiki pages and CLAUDE.md/rules files are likely relevant

---

## Phase 1: Tests

### 1a. Run existing tests — surface regressions, don't fix them

Run tests for each affected workspace only:

```bash
npx vitest run -w @fi-product/web
npx vitest run -w @fi-product/functions
npx vitest run -w @fi-product/durable-functions
npx vitest run -w @fi-product/schemas
```

**If a test fails:** Stop. Don't modify the test. The test is telling you something about the production code. Read what the test asserts, understand what it expects, and surface it clearly to the user — what the test expects vs. what it actually gets. The user decides whether to fix the code or update the test intentionally. Your job is to make the problem visible, not make it go away.

### 1b. Run lint

Run the linter for each affected workspace:

```bash
npm run lint -w @fi-product/web
npm run lint -w @fi-product/functions
npm run lint -w @fi-product/durable-functions
npm run lint -w @fi-product/schemas
```

Fix any lint errors in the changed files. If a lint rule fires on something that looks intentional, flag it rather than silently suppressing it.

### 1c. Check coverage on new code

Run coverage for affected workspaces:

```bash
npx vitest run --coverage -w @fi-product/web
npx vitest run --coverage -w @fi-product/functions
npx vitest run --coverage -w @fi-product/durable-functions
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

Match the patterns in existing `__tests__/` directories in the same workspace. Use what's already there — don't invent new test utilities.

---

## Phase 2: Type Safety

Scan only the changed files. Skip `packages/functions-shared/` — that package intentionally disables `noImplicitAny` and is out of scope.

Find and fix:

- `: any` type annotations, `as any` casts, `Array<any>`, `Promise<any>`
- `unknown` used without narrowing — if a value is typed `unknown`, it must be narrowed before use
- `Record<string, any>` or `{ [key: string]: any }` — replace with a concrete shape, or `Record<string, unknown>` plus a narrowing guard
- Type assertions (`as Foo`) that paper over a mismatch rather than properly narrowing
- Missing return types on exported functions

Fix the actual type, not the symptom. If something is typed `any` because the real shape was unclear, read the code and determine the real shape. Swapping `any` for `unknown` without adding a narrowing guard is not a fix.

### 2b. HTTP handler response schemas (`satisfies`)

If the diff touches any HTTP handler in `apps/functions/src/functions/http/`, check that every handler return uses `satisfies` against its response schema from `@fi-product/schemas/api`:

```ts
// correct
return { status: 200, jsonBody: { ... } satisfies MyResponseSchema };

// wrong — no compile-time contract
return { status: 200, jsonBody: { ... } };
```

For any handler that returns data but lacks a `satisfies` check:

1. Find or confirm the matching response schema in `packages/schemas/src/api/`
2. If no schema exists for the response shape yet, create one and re-export it from `src/api/index.ts`
3. Add `satisfies` to the handler return

This is the contract between backend and frontend — a handler that returns untyped JSON is a schema drift waiting to happen.

### 2c. Real permissions on HTTP handlers

For every handler touched by the diff, check the `withAuth()` call. `"TOKEN_VALIDATION_ONLY"` means the request is authenticated but no permission is actually enforced — it's a placeholder, not a real access control decision.

```ts
// wrong — skips permission enforcement
withAuth("TOKEN_VALIDATION_ONLY", [...], handler)

// correct — real permission
withAuth("read:reports_admin", [...], handler)
```

If you see `TOKEN_VALIDATION_ONLY` on a handler in the diff, flag it. Don't silently leave it — surface it in the wrap-up report under "Needs your attention" with the file and route so the right permission can be assigned. The permission type is imported from `@fi-product/schemas/permissions` and is codegen'd from Auth0, so the correct value must come from that list.

---

## Phase 3: Documentation

### 3a. CLAUDE.md and rules files

Look at which CLAUDE.md and `.claude/rules/system/` files cover the areas touched by the diff. Update them to reflect:

- New patterns established by this change
- New files or modules that others should know about
- Changed behavior that contradicts existing guidance
- Edge cases or gotchas discovered during this work

Files that may need updating:

- `CLAUDE.md` (root)
- `apps/web/CLAUDE.md`
- `apps/durable-functions/CLAUDE.md`
- `packages/schemas/CLAUDE.md`
- `packages/functions-shared/src/services/arrow/CLAUDE.md`
- `.claude/rules/system/` — the rule files covering the affected domains

Only add content that genuinely helps someone working in that area. Don't pad.

### 3b. Wiki (`/docs/wiki/`)

Find which wiki pages cover the features you changed. Update them to match current behavior.

| File                       | Covers                      |
| -------------------------- | --------------------------- |
| `Home.md`                  | High-level product overview |
| `Automations.md`           | Automation system           |
| `Activity-Feed.md`         | Activity poll + feed        |
| `Data-Pipeline.md`         | Arrow/Perspective pipeline  |
| `Data-Tables.md`           | TanStack table patterns     |
| `Datasets.md`              | DatasetDef definitions      |
| `Dashboards.md`            | Dashboard system            |
| `Daily-Digest-Email.md`    | Digest email feature        |
| `Permissions.md`           | Auth0 permissions           |
| `Small-Business-Detail.md` | SMB detail page             |
| `AI-Assistant.md`          | Chat / AI features          |

Wiki updates are user-facing: "here's how the feature works." Keep implementation details in CLAUDE.md instead.

---

## Wrap-Up Report

When all four phases are done, produce this summary:

```
## Wrap-It-Up Summary

### Tests
- Existing tests: pass / failing: <list with description>
- New tests written: <list — what each covers>

### Types
- Issues fixed: <list of files + what changed> / none found

### Docs updated
- CLAUDE.md / rules: <list of files changed, or "none needed">
- Wiki: <list of files changed, or "none needed">

### Needs your attention
<anything that requires human judgment: failing tests, architectural questions, intentional type workarounds>
```

---

## Scope notes

- All checks are scoped to `git diff main...HEAD --name-only`
- `packages/functions-shared/` is exempt from type checks
- Only run tests for workspaces that have changed files
