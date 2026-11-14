# Changelog

All notable changes to **marjames** (Cortis Fandom Social Web) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
- **Serverless & DB latency optimization**: Pinned Vercel Functions to `icn1` (Seoul, co-located with Supabase `ap-northeast-2`), enabled Better Auth `session.cookieCache`, deduplicated `getServerUser` with `React.cache`, and parallelized `/u/[username]` SSR queries.
- Set **Dark theme** and **Vietnamese (`vi`)** as the default experience when no saved user preference exists.
- Unified mobile `.bottom-nav` active/hover items and `.nav-create-box` to circular/pill `border-radius: 999px`.
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

[Unreleased]: https://github.com/lgdlong/code-mj/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/lgdlong/code-mj/releases/tag/v0.1.0
