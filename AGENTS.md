# AGENTS.md

This guide is for autonomous coding agents working in `makemeet`.

## 1) Project Snapshot

- App: MakeMeEt (CV/Resume generator UI in Spanish)
- Stack: React 18 + TypeScript + Vite (SWC)
- UI: Tailwind CSS + shadcn/ui
- Data/Auth: Supabase (`@supabase/supabase-js`)
- State/Data fetching: TanStack Query
- Forms: React Hook Form + Zod
- Tests: Vitest + Testing Library + jsdom

## 2) Runbook: Build / Lint / Test

Use npm scripts from `package.json`:

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run test
npm run test:watch
```

### Single test file (important)

```bash
npx vitest run src/path/to/file.test.ts
```

Equivalent by config pattern:

```bash
npx vitest run src/**/*.{test,spec}.{ts,tsx}
```

Optional: run a single test case by name:

```bash
npx vitest run src/path/to/file.test.ts -t "test name"
```

## 3) Docker Commands

```bash
docker-compose up -d
docker-compose build --no-cache && docker-compose up -d
```

If `.env` changes, rebuild image before bringing services up.

## 4) Repository Structure (high value paths)

- `src/pages/` route pages (`Index`, `Setup`, `ResetPassword`, `NotFound`)
- `src/components/templates/` CV templates
- `src/components/cv/` CV management UI
- `src/components/setup/` setup wizard + key management
- `src/components/auth/` auth dialogs
- `src/components/ui/` shadcn/ui primitives
- `src/contexts/` `AuthContext`, `SetupContext`
- `src/hooks/` custom hooks (`useCVs`, `useGitHub`, etc.)
- `src/services/` domain services (`setupService`, `aiService`)
- `src/types/` app types
- `src/integrations/supabase/` Supabase client/types
- `supabase/migrations/` SQL migrations

## 5) Non-negotiable File Rules

- Do not manually edit `src/components/ui/*` (shadcn-managed primitives).
- Do not edit `src/integrations/supabase/client.ts` by hand (auto-generated warning in file).
- Preserve Spanish UX copy and variable naming conventions where already established.

## 6) Imports and Module Conventions

- Use path alias `@/` for `src/*` imports.
- Prefer grouping imports in this order:
  1) React/framework
  2) third-party packages
  3) internal `@/` modules
  4) local relative imports
- Keep import style consistent with the touched file; avoid churn-only reordering.
- Use `import type` for type-only imports where practical.

## 7) Formatting and General Style

- Follow existing file style first (repo has mixed quote usage).
- Keep semicolons and trailing commas consistent with local file style.
- Avoid large unrelated formatting diffs.
- Keep comments minimal and useful; remove redundant comments.
- Keep UI text in Spanish unless feature clearly requires otherwise.

## 8) TypeScript Guidelines

- TS strictness is intentionally relaxed (`strict: false`, `noImplicitAny: false`, `strictNullChecks: false`).
- Still prefer explicit typing on:
  - exported functions
  - context values
  - hook return contracts
  - service boundaries
- Use `interface` for object/domain contracts (`CVData`, etc.).
- Use union types for constrained string enums.
- Avoid introducing `any`; use `unknown` + narrowing when possible.
- Treat generated Supabase types as source of truth for DB row shapes.

## 9) Naming Conventions

- Components: PascalCase (`PageHeader`, `SaveCVDialog`)
- Hooks: `useX` (`useCVs`, `useGitHub`)
- Context providers: `XProvider`; hook accessors `useX`
- Functions/vars: keep language consistent with file (many domain modules use Spanish names)
- Constants: UPPER_SNAKE_CASE for true constants (`SQL_SETUP`, `SESSION_STORAGE_KEY`)

## 10) React and State Patterns

- Functional components with hooks only.
- Keep state local unless cross-cutting.
- Prefer `useCallback` for async functions passed to effects.
- In context hooks, throw explicit error when used outside provider.
- Preserve existing route/bootstrap flow in `src/main.tsx` + `src/App.tsx`.

## 11) Data / Supabase Patterns

- Use shared Supabase client from `@/integrations/supabase/client`.
- Maintain RLS-aware logic: always scope data by authenticated user.
- Validate auth presence before write operations.
- Keep serialization behavior for JSON payloads when existing code depends on it.

## 12) Error Handling and UX Feedback

- For user-facing actions, show feedback via toasts (`sonner` / app toaster).
- For service failures, prefer:
  - actionable user message
  - structured console logging for diagnostics
  - safe fallback return where appropriate
- Throw errors for truly exceptional paths; return booleans/null for expected failure paths when existing API already follows that contract.
- Do not swallow errors silently unless explicitly intentional with fallback.

## 13) Testing Guidelines

- Framework: Vitest (`jsdom`, globals enabled).
- Setup file: `src/test/setup.ts`.
- Test file patterns: `src/**/*.{test,spec}.{ts,tsx}`.
- Prefer behavior-driven test names and user-visible outcomes.
- For UI tests, use Testing Library patterns and `@testing-library/jest-dom` assertions.

## 14) Environment and Config

- Prefer `window.env` runtime values in Dockerized runtime where applicable.
- Fallback to `import.meta.env` for local builds.
- Never commit secrets; only `VITE_` public client vars belong in frontend runtime config.

## 15) Agent Workflow Checklist (per change)

1. Read nearby files and follow local patterns.
2. Make minimal, scoped edits.
3. Run lint:
   - `npm run lint`
4. Run relevant tests:
   - `npx vitest run src/path/to/file.test.ts`
   - or `npm run test`
5. If touching build/runtime behavior, run:
   - `npm run build`
6. Summarize behavior impact and any follow-up work.

## 16) Rules Discovery Notes

- Cursor rules: none found in `.cursor/rules/` or `.cursorrules`.
- Copilot rules: none found in `.github/copilot-instructions.md`.

If these files are added later, update this AGENTS.md and treat them as higher-priority repo instructions.
