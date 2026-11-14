<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Overview (`marjames`)

Private, mobile-first Threads-style social web for the **Cortis** fandom, capped at **1,000 members**.

- **Runtime & Tooling:** Bun (`bun run dev|build|typecheck|lint`, `bun --env-file=.env run db:push|db:generate`).
- **Stack:** Next.js 16.4.6 (App Router, Turbopack), React 19, TypeScript, TanStack Query, Better Auth (Google OAuth + Prisma Adapter), PostgreSQL (Supabase via `@prisma/adapter-pg`), Cloudinary.

## Locked Product & Architecture Decisions

1. **Auth & Member Cap:**
   - Google OAuth only (`socialProviders.google` in `src/server/auth.ts`).
   - Unauthenticated or banned users are blocked at server/API boundaries (`requireSessionUser`, `getServerUser`) and redirected to `/login`.
   - `databaseHooks.user.create.before` enforces `MAX_USERS = 1000` (`src/lib/constants.ts`) and promotes comma-separated `ADMIN_EMAIL` addresses to `admin` on first sign-up.
2. **Media & Bandwidth Protection:**
   - Max **5 images per post** (`MAX_POST_IMAGES`, `src/lib/constants.ts`); each image gets client-side WebP compression (`browser-image-compression`, `<= 1200px`, `< 0.28 MB`) before signed Cloudinary upload (`/api/upload`).
   - Posts store parallel arrays `imageUrls` / `imagePublicIds` (`Post.imageUrls @map("images")` in `prisma/schema.prisma`).
   - Server validates media payloads via `parsePostImages` (`src/server/http.ts`): ≤ 5 pairs, every URL passes `isSafeMediaUrl` — only `https://res.cloudinary.com/...` (plus Google avatar URLs for profile updates). Delete/edit destroys only removed Cloudinary assets (`destroyCloudinaryAssets`).
3. **Engagement & Comments:**
   - **Heart-only** likes on posts (`Like`) and comments (`CommentLike`); no public dislikes.
   - **Strict 2-level comments** (`parentId` points only to a top-level comment). Replying to level 1 or level 2 auto-prefills `@username ` in the input (YouTube-style), keeps `parentId` at level 1, and renders `@username` as clickable blue `/u/[username]` links.
4. **Defaults & Persistence:**
   - Default theme is **dark** (`data-theme="dark"`) and default language is **Vietnamese** (`lang="vi"`).
   - User theme/language preferences are stored in `UserSetting` (`user_setting` table via `/api/users/me/settings`) and read from DB before local fallback.
5. **Search & Moderation:**
   - `/search` syncs URL params (`?q=...&filter=top|recent`), supports `@username` prefix filtering, and keeps up to `RECENT_SEARCH_LIMIT = 10` local history entries (users + keywords).
   - `/admin` is desktop-only (`>= 1024px`); `requireAdminUser` protects all admin routes, and admins cannot ban or report-ban other admins.
6. **Supabase Free-Tier Keep-Alive:**
   - `/api/health` executes `prisma.user.count()` (not `SELECT 1`) and is pinged by `vercel.json` cron and `.github/workflows/keep-alive.yml`.

## Code Conventions & Guardrails

- Keep `src/components/*` and `src/hooks/*` modular (target `< 200` lines per file); lazy-load modals and admin tabs via `next/dynamic` with `ssr: false`.
- Use `src/lib/i18n.ts` (`t(...)` and `readApiError(...)`) for all user-facing strings and error toasts — no hardcoded VI/EN strings in client components.
- Always run `bun run typecheck && bun run build` after code changes before declaring done.
- Keep the `BEGIN/END:nextjs-agent-rules` block above intact.
