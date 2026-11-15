# Changelog

All notable changes to **marjames** (Cortis Fandom Social Web) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-11-16

### Added
- **Video posts on Cloudflare R2**: One video per post alongside up to 5 images. `POST /api/upload/video` returns a 10-minute presigned `PUT`; the browser uploads straight to R2 (Vercel caps bodies at 4.5 MB, so the file is never proxied). Limits `MAX_VIDEO_MB` 50 / `MAX_VIDEO_SECONDS` 60, containers `video/mp4` + `video/quicktime`, **H.264 only** — HEVC (`hvc1`/`hev1`, iPhone "High Efficiency") is refused by a client-side byte scan because there is no transcode worker. `verifyVideoObject` HEADs the object (size, content-type, owner prefix `vid/<userId>/`) before persisting; deletes go through `deleteVideoObject`.
- **Likes viewer**: Tapping the heart count on any post opens a likes sheet (`GET /api/posts/[id]/likes`, keyset-paginated 30 per page) listing every member who hearted it, with profile links — visible to all members. The heart icon still toggles the like.
- **System notifications**: Bell in the header with an unread badge (`GET /api/notifications/unread`, 30s poll) and a `/notifications` page listing new likes, comments, replies, and follows. Read state is a single `UserSetting.notificationsSeenAt` watermark (`POST /api/notifications/seen`); the activity feed is derived from `Like`/`Comment`/`Follow` rows so unlike/unfollow drops its notification and nothing can go stale.
- **Comment likes**: Members can heart/unheart both top-level comments and level-2 replies (`POST /api/comments/[id]/like`).
- **YouTube-style level-2 replies & `@mention` links**: Clicking Reply on any level-1 or level-2 comment auto-prefills `@username` in the input, keeps the thread at 2 levels, and highlights `@username` mentions as clickable profile links.
- **Persistent user preferences**: Added `UserSetting` (`user_setting`) in PostgreSQL and `GET`/`PATCH /api/users/me/settings` so dark/light theme and Vietnamese/English language sync across sessions.
- **Search history & Top/Recent filter**: Search now stores up to 10 recent entries (both users and keywords), syncs `q` and `filter=top|recent` in the URL, and supports sorting posts by most liked (`Top`) or newest (`Recent`).
- **Infinite-scroll feed & comment pagination**: Home feed now loads 10 posts per page (`useInfiniteQuery` + `IntersectionObserver`) and post details load 15 top-level comments per page via cursor pagination (`GET /api/posts/[id]/comments?cursor=...`).
- **Fullscreen image lightbox**: Clicking any post image opens an edge-to-edge fullscreen viewer rendered via `createPortal` with Escape/backdrop close.
- **Route-specific loading skeletons & lazy loading**: Added dedicated skeleton screens for feed, post detail, profile, compose, search, profile settings, and admin routes, and lazy-loaded heavy modals and admin tabs.
- **CI workflow & community documentation**: Added `.github/workflows/ci.yml` for automatic Prisma generate, TypeScript typecheck, and Next.js build on push/PR, and updated `README.md` (with mobile UI screenshots in `docs/screenshots/`), `AGENTS.md`, and `CHANGELOG.md`.

### Changed
- **Quality-first images + server-side optimization**: Removed the 0.28 MB client target that produced visibly degraded photos. Originals now upload untouched when they are `jpeg/png/webp` and `<= 4 MB`; everything else (larger files, HEIC and other containers sharp's prebuilt binaries cannot decode) is re-encoded client-side (1600px WebP q0.95). `/api/upload` became a multipart proxy: `optimizeImage` does at most one lossy generation, all with `sharp` (resize+WebP at 1600px q88 only when the image is oversized or above 2 MB), then streams the bytes to Cloudinary, replacing the browser-side signed upload. `publish()` uploads the batch concurrently. A TinyPNG/Tinify pass was built, measured as lossy (max channel diff 52/255, 500 compressions/month, 1.5–8 s per image) and **removed**.
- **Serverless & DB latency optimization**: Pinned Vercel Functions to `icn1` (Seoul, co-located with Supabase `ap-northeast-2`), enabled Better Auth `session.cookieCache`, deduplicated `getServerUser` with `React.cache`, and parallelized `/u/[username]` SSR queries.
- Set **Dark theme** and **Vietnamese (`vi`)** as the default experience when no saved user preference exists.
- Unified mobile `.bottom-nav` active/hover items and `.nav-create-box` to circular/pill `border-radius: 999px`.
- **Rounded icon set**: Every square-bodied Phosphor glyph (`VideoCamera`, `ImageSquare`, `ArrowSquareOut`) is replaced by a hand-drawn rounded glyph in `src/components/icons.tsx` (`ImageGlyph`, `VideoGlyph`, `ExternalGlyph`), shared by the composer, the comment composer and the admin tables; icon-only buttons use circular hit areas.
- Replaced the wide `@username ×` reply chip in the comment composer bar with inline `@username` input prefill so the Send button is never clipped on narrow screens, and removed the `"Tối đa 2 tầng bình luận"` hint text.

### Fixed
- **Vercel Prisma build & default assets**: Updated `package.json` `build` script to run `bun run db:generate` before `next build`, and removed default `src/app/favicon.ico` and starter `public/*.svg` icons so browser tabs use `src/app/icon.png`.
- **Dotted `@username` mentions**: Updated comment mention parsing so usernames containing dots (e.g. `@lgd.long`) highlight and link completely without swallowing trailing sentence punctuation.
- **API input & media validation**: Rejected non-Cloudinary media URLs on post creation/update, enforced non-empty report reasons and blocked self-reporting, prevented admins from banning or report-banning other admins, and capped search query length to 100 characters.
- **Comment composer overflow**: Added `min-width: 0` on `.comment-input` and `flex-shrink: 0` on `.btn-post-sm` to prevent flex-row clipping.
## [0.1.0] - 2026-11-14

Initial release of **marjames** — private Threads-style social web for the Cortis fandom.

### Added
- **Google OAuth & 1,000-member cap**: Better Auth integration with Google-only sign-in, `MAX_USERS = 1000` enforcement on registration, optional `ADMIN_EMAIL` bootstrap, and full-app login gate (`/login`).
- **Threads-style feed & composer**: Mobile-first layout with **For You** and **Following** tabs, cursor-paginated feed, and single-image posts with client-side WebP compression (`<= 1200px`, `< 0.28 MB`) uploaded to Cloudinary.
- **Post interactions & profiles**: Instagram-style heart likes, 2-level comments, follow/unfollow, user profiles (`/u/[username]`), and profile editing with a 30-day username change cooldown.
- **Desktop admin dashboard (`/admin`)**: Overview stats, post/comment moderation, user ban/unban, and report resolution.
- **Supabase keep-alive**: Real database ping on `/api/health` paired with Vercel Cron (`vercel.json`) and GitHub Actions (`.github/workflows/keep-alive.yml`).

[Unreleased]: https://github.com/lgdlong/code-mj/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/lgdlong/code-mj/releases/tag/v1.0.0
[0.1.0]: https://github.com/lgdlong/code-mj/releases/tag/v0.1.0
