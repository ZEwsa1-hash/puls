<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16.2.3. APIs, conventions, and file structure may differ from older Next.js versions. Before changing Next.js behavior, routing, metadata, caching, server/client component boundaries, CSS handling, images, or build configuration, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Agent Guide

## Project Snapshot

- App name: `puls`
- Stack: Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Ant Design 6, Zustand, Recharts
- Source root: `src/`
- Routes live under `src/app/`
- Shared layout component: `src/components/AppLayout.tsx`
- Shared client stores: `src/store/`
- Package manager: npm, lockfile is `package-lock.json`

## Session Memory

- Before starting work, read `docs/codex-session-notes.md` to understand recent Codex sessions and open follow-ups.
- Before finishing work, append a concise entry to `docs/codex-session-notes.md` with the date, goal, changed files, key decisions, verification, and next steps.
- Use `npm run session:note` to generate a correctly formatted session note when practical.
- Keep the session log in Markdown so it can be used directly from Obsidian.
- Do not add secrets, API keys, tokens, or private credentials to session notes.
- Do not introduce a backend or database only for Codex memory unless the user explicitly asks for multi-user sync, structured search, or app-managed note editing.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Local dev URL: `http://localhost:3001`
- Build: `npm run build`
- Lint: `npm run lint`
- Add session note: `npm run session:note`

Run `npm run lint` after code edits. Run `npm run build` when touching routing, Next config, metadata, server/client boundaries, dynamic imports, or dependency usage.

## Architecture Notes

- This project uses the App Router from `src/app`, not the Pages Router.
- A folder under `src/app` becomes a public route only when it contains `page.tsx` or `route.ts`.
- Most current pages are Client Components because they use Ant Design, Zustand, charts, browser state, or `localStorage`.
- Keep Client Component boundaries narrow. Add `"use client"` only when a file needs hooks, event handlers, browser APIs, Zustand hooks, Ant Design interactivity, or Recharts.
- Pages using browser-only libraries should keep dynamic imports with `ssr: false` where needed.
- Use the `@/*` path alias for imports from `src/*`.

## Current Routes

- `/puls-gemini` - cardio tracker
- `/training-tracker` - training program tracker
- `/gym` - gym exercise data
- `/analytics` - cardio analytics with Recharts
- `/heatmap` - heatmap view
- `/puls-kiro` - separate styled route with local CSS

When adding a new primary route, update `src/components/AppLayout.tsx` menu items so navigation stays consistent.

## Styling

- Global Tailwind and theme tokens are in `src/app/globals.css`.
- Route-specific plain CSS currently exists in `src/app/puls-kiro/styles.css` and `src/app/training-tracker/styles.css`.
- Prefer Tailwind utilities or colocated route/component CSS. Keep truly global CSS in `globals.css`.
- Ant Design theme customization is centralized in `src/components/AppLayout.tsx`.
- Be careful with CSS import order. For broader CSS changes, verify with `npm run build` because production CSS chunking can differ from dev.

## State and Persistence

- Zustand stores are in `src/store/`.
- Training tracker persistence also uses local services and hooks under `src/app/training-tracker/`.
- Any direct `window`, `document`, or `localStorage` access must stay inside Client Components, effects, event handlers, or SSR-safe wrappers.
- Keep stored data migrations backward-compatible when changing persisted shapes.

## Next.js 16 Specific Workflow

Before editing Next.js-specific behavior, consult the bundled docs rather than relying on memory:

- Project structure: `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- Server and Client Components: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- CSS: `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- Images: `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`
- Metadata: `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`
- Route handlers: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- Proxy: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`

## Code Style

- TypeScript is strict. Avoid `any` unless the surrounding code already requires it and the reason is clear.
- Keep components focused and colocate feature-only helpers with their route.
- Prefer typed domain models in `types/` files for larger feature areas.
- Do not introduce a second package manager or modify lockfiles except through npm.
- Do not edit generated directories such as `.next/` or `node_modules/`.

## Git Hygiene

- The worktree may contain user changes. Do not revert or overwrite unrelated edits.
- Check `git status --short` before large edits.
- Keep commits and patches scoped to the requested task.
