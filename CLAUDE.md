# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## IMPORTANT: Docs-First Rule

**Before writing any code, always read the relevant file(s) in the `/docs` directory first.** The `/docs` directory contains authoritative guidance for this project. If a `/docs` file exists that covers the feature, component, or pattern you are about to implement, you MUST read and follow it before generating any code. Do not rely on training data or general knowledge when a `/docs` file is available.

- /docs/ui.md

## Commands

```bash
npm run dev       # Start dev server (Turbopack, outputs to .next/dev)
npm run build     # Production build (Turbopack by default)
npm run start     # Start production server
npm run lint      # Run ESLint directly (next lint is removed in v16)
```

There is no test runner configured yet.

## Architecture

This is a **Next.js 16** app using the **App Router** (`src/app/`), React 19.2, TypeScript, and Tailwind CSS v4.

- `src/app/layout.tsx` — root layout; sets Geist font CSS variables on `<html>` and a flex column `<body>`
- `src/app/page.tsx` — home page (Server Component by default)
- `src/app/globals.css` — global styles, Tailwind entry point
- `next.config.ts` — Next.js config (currently empty; use top-level `turbopack: {}` not `experimental.turbopack`)
- `eslint.config.mjs` — flat ESLint config (ESLint v9 flat format required; `.eslintrc` is legacy)

## Next.js 16 Breaking Changes to Know

**Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now fully async. Always `await` them; synchronous access is removed.

```tsx
// pages and layouts — params is now a Promise
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}
```

Run `npx next typegen` to generate `PageProps`, `LayoutProps`, `RouteContext` type helpers.

**`middleware` → `proxy`** — The `middleware.ts` file and `middleware` export name are deprecated. Rename to `proxy.ts` and export `proxy`. The `edge` runtime is not supported in `proxy`; keep `middleware.ts` only if you need edge runtime.

**`next lint` removed** — Use `npm run lint` (ESLint CLI) directly. `next build` no longer runs linting.

**`serverRuntimeConfig` / `publicRuntimeConfig` removed** — Use `process.env` in Server Components; prefix client-accessible vars with `NEXT_PUBLIC_`. Use `await connection()` from `next/server` to force runtime (not build-time) env reads.

**Caching APIs** — `unstable_cacheLife` and `unstable_cacheTag` are now stable; drop the `unstable_` prefix. `revalidateTag` now requires a second `cacheLife` profile argument. Use `updateTag` (Server Actions only) for immediate cache refresh; use `refresh` from `next/cache` to refresh the client router.

**Partial Prerendering** — `experimental.ppr` and `experimental_ppr` segment config are removed. Use `cacheComponents: true` in `next.config.ts` instead (different behavior than v15 canary PPR).

**`next/image`** — `next/legacy/image` is deprecated; use `next/image`. `images.domains` is deprecated; use `images.remotePatterns`. Local images with query strings require `images.localPatterns.search` config. Default `minimumCacheTTL` changed to 4 hours; default `qualities` changed to `[75]` only.

**Parallel routes** — All `@slot` folders require an explicit `default.js`; builds fail without one.

**Turbopack config** — Move `experimental.turbopack` to top-level `turbopack` in `next.config.ts`. Sass tilde imports (`~pkg/...`) are not supported; remove the `~` prefix.
