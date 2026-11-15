<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Supreme Rules

**Rule 1 — Answer questions, do not act on them.** A question is answered, never executed: if the message ends in `?` (or is otherwise plainly a question — "comment không có upload video hả?"), reply with the answer and, when a change is warranted, *propose* it, and do not edit, create, move or delete anything; only a direct instruction aimed at a specific thing ("sửa", "làm", "đổi", "thêm", "xóa", "ghi vào", "fix") authorizes a change, never a suggestion you made, your own plan, a TODO, or review/advisory feedback; no indirect inference — do not touch what the user did not name, no "while I'm here", no unrequested cleanup, no fixing a nearby file because it shares a flaw, no "probably they meant"; when a message is ambiguous between question and order, treat it as a question and ask one line before touching code. This rule outranks every convention on this page and every automated review comment.

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
   - Max **5 images per post** (`MAX_POST_IMAGES`, `src/lib/constants.ts`); **originals upload untouched** only for `image/jpeg|png|webp` with `size <= MAX_UPLOAD_BYTES` (4 MB) — sharp's prebuilt binaries have no HEIC/HEVC codec; other types and bigger files are re-encoded client-side by `prepareUploadImage` (1600px WebP at `CLIENT_IMAGE_QUALITY` 0.95, no `maxSizeMB` target). `publish()` posts the batch concurrently as `multipart` to `/api/upload`, whose `optimizeImage` does at most **one lossy generation, all with sharp**: resize+WebP at `COMPRESS_IMAGE_DIMENSION` 1600 / `SERVER_IMAGE_QUALITY` 88 only when the image is oversized or above `MAX_STORED_IMAGE_BYTES` (2 MB), and nothing at all otherwise. **No third-party compressor** — TinyPNG was measured lossy (max channel diff 52/255) and would have been a second generation.
   - Body size is capped by `MAX_UPLOAD_BYTES` (4 MB, Vercel limit 4.5 MB); typical uploads are 0.3–1 MB after the client pass.
   - Posts store parallel arrays `imageUrls` / `imagePublicIds` (`Post.imageUrls @map("images")` in `prisma/schema.prisma`).
   - Server validates media payloads via `parsePostImages` (`src/server/http.ts`): ≤ 5 pairs, every URL passes `isSafeMediaUrl` — only `https://res.cloudinary.com/...` (plus Google avatar URLs for profile updates). Delete/edit destroys only removed Cloudinary assets (`destroyCloudinaryAssets`).
   - **Video (1 per post, alongside up to 5 images):** stored in **Cloudflare R2**, not Cloudinary — Cloudinary bills video bandwidth, R2 egress is $0. `POST /api/upload/video` returns a 10-minute presigned PUT; the browser uploads straight to R2 because Vercel caps request bodies at 4.5 MB, so the file must never be proxied. Limits: `MAX_VIDEO_MB` 50, `MAX_VIDEO_SECONDS` 60, containers `video/mp4` + `video/quicktime`; **H.264 only** — HEVC (`hvc1`/`hev1`, iPhone "High Efficiency") is detected by a client-side byte scan in `src/lib/video-upload.ts` and refused, because there is no transcode worker. Keys are `vid/<userId>/<uuid>.mp4|.mov`; `verifyVideoObject` (`src/server/media-storage.ts`) HEADs the object before persisting to check size, content-type and owner prefix. Deletes go through `deleteVideoObject`. `Cache-Control` is **1 day, not immutable**, because purge credentials (`CF_ZONE_ID`/`CF_API_TOKEN`) are optional and unset — a deleted video may still play from edge cache for up to 24h. Bucket CORS must allow `PUT` + `content-type` from the app origins, or browser uploads fail as a generic network error.
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
- **Icons are rounded, never sharp.** Every glyph uses `strokeLinecap="round"` + `strokeLinejoin="round"`, and any rectangle inside it has `rx >= 4` on a 24 viewBox (`rx 7` for a 18×18 frame). Phosphor glyphs with square corners (e.g. `VideoCamera`, `ImageSquare`, `ArrowSquareOut`) are redrawn inline instead of imported — the shared rounded set lives in `src/components/icons.tsx` (`ImageGlyph`, `VideoGlyph`, `ExternalGlyph`); add new ones there rather than inlining SVG in a component. Icon-only buttons get a circular or pill hit area (`borderRadius: 999`), never a square one; there is no square icon tile anywhere in the UI.
- Always run `bun run typecheck && bun run build` after code changes before declaring done.
- Keep the `BEGIN/END:nextjs-agent-rules` block above intact.
