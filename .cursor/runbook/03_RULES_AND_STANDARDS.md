# Rules & Standards

## Coding Conventions

### TypeScript

- **Strict mode** always (`strict: true` in all tsconfigs)
- Prefer `interface` for object shapes; `type` for unions/intersections
- No `any` — use `unknown` + narrowing
- Explicit return types on exported functions
- Use path aliases: `@codex/ui`, `@codex/schemas`, etc.

### Naming

| Entity | Convention | Example |
|--------|------------|---------|
| React components | PascalCase | `DiceRoller.tsx` |
| Hooks | camelCase, `use` prefix | `useSyncedDoc.ts` |
| Utilities | camelCase | `parseDiceNotation.ts` |
| Constants | SCREAMING_SNAKE | `MAX_UPLOAD_BYTES` |
| DB tables | snake_case | `map_snapshots` |
| API routes | kebab-case paths | `/api/game-systems` |

### File Organization

- One primary export per file for components
- Colocate tests: `foo.test.ts` next to `foo.ts`
- Barrel exports (`index.ts`) only at package boundaries — not deep nesting

### React

- Functional components only
- Server Components by default in `apps/web/app/`; `"use client"` only when needed
- Extract hooks when logic exceeds ~15 lines or is reused
- No prop drilling past 2 levels — use context or Zustand

### Styling

- Tailwind utility classes first
- `cn()` helper (clsx + tailwind-merge) for conditional classes
- Design tokens via CSS variables in `packages/ui/styles/tokens.css`
- **No arbitrary hex colors in components** — use token names

## Error Handling

### Client

```typescript
// Pattern: Result type for expected failures
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Unexpected errors → Error Boundary + Sentry
// User-facing: toast via sonner, never raw stack traces
```

- Network failures during offline: queue mutation, show subtle "pending sync" indicator
- Validation failures: inline field errors from Zod
- Sync conflicts (CRDT): silent merge; log anomaly if manual resolution needed

### Server (Route Handlers)

- Zod validate input at boundary
- Return `{ error: string, code: string }` with proper HTTP status
- Log server-side details; never leak internals to client

## State Management Rules

1. **If it syncs** → Dexie + Yjs (never raw localStorage for structured data)
2. **If it's server data** → TanStack Query (no manual fetch in useEffect)
3. **If it's UI-only** → Zustand or local useState
4. **If it's a form** → React Hook Form until submit, then Dexie/Query

## Testing Requirements

| Layer | Tool | Coverage expectation |
|-------|------|---------------------|
| Unit | Vitest | `game-engine`, `schemas`, parsers — 90%+ |
| Component | Vitest + Testing Library | Critical UI (dice, sheets) |
| E2E | Playwright | Happy paths: solo session, sheet save, map load |
| Sync | Integration tests | Offline write → reconnect → merge |

Run before PR: `pnpm turbo run test lint typecheck`

## Git & Commits

Format: `[TICKET] :gitmoji: type(scope): summary`

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## Deployment Pipeline (Planned)

```
PR → GitHub Actions
  ├── turbo lint
  ├── turbo typecheck
  ├── turbo test
  └── Playwright (main only)

main → Vercel preview → manual promote
main (tagged) → Vercel production + sync-server deploy
```

## Environment Variables

- Validated at startup via Zod in `apps/web/lib/env.ts`
- Never commit `.env*` except `.env.example`
- Required prod vars documented in `apps/web/.env.example`

## Gotchas & Technical Debt

*(Updated as codebase grows)*

- **Excalidraw + Yjs**: Scene sync via `excalidraw-elements` Y.Array in play-room doc; dynamic import (`ssr: false`) required in Next.js
- **IndexedDB quotas**: Compress images client-side before store; prune old session logs
- **SSR + Dexie**: Dexie/Yjs only in Client Components or dynamic `ssr: false` imports
- **Solo engines**: Each system has different oracle shapes — resist one-size-fits-all UI; use plugin render props
- **PWA updates**: Serwist skipWaiting strategy must be tested to avoid mid-session reloads

## Accessibility

- WCAG 2.1 AA minimum
- All interactive elements keyboard-navigable
- Dice results announced via `aria-live` regions
- Color contrast verified against Codex dark/light tokens

## Performance Rules

- Lazy-load game system plugins (`dynamic import`)
- Virtualize long lists (character library, journal)
- Map assets: WebP/AVIF, max dimensions enforced client-side
- No blocking sync on UI thread — Web Workers for heavy oracle table prep if needed
