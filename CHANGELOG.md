# Changelog

All notable changes to **marjames** (Cortis Fandom Social Web) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Comment likes**: Members can heart/unheart both top-level comments and level-2 replies (`POST /api/comments/[id]/like`).
- **YouTube-style level-2 replies & `@mention` links**: Clicking Reply on any level-1 or level-2 comment auto-prefills `@username` in the input, keeps the thread at 2 levels, and highlights `@username` mentions as clickable profile links.
- **Persistent user preferences**: Added `UserSetting` (`user_setting`) in PostgreSQL and `GET`/`PATCH /api/users/me/settings` so dark/light theme and Vietnamese/English language sync across sessions.
- **Search history & Top/Recent filter**: Search now stores up to 10 recent entries (both users and keywords), syncs `q` and `filter=top|recent` in the URL, and supports sorting posts by most liked (`Top`) or newest (`Recent`).
- **Route-specific loading skeletons & lazy loading**: Added dedicated skeleton screens for feed, post detail, profile, compose, search, profile settings, and admin routes, and lazy-loaded heavy modals and admin tabs.
- **CI workflow & community documentation**: Added `.github/workflows/ci.yml` for automatic Prisma generate, TypeScript typecheck, and Next.js build on push/PR, and updated `README.md` and `AGENTS.md`.

### Changed
- Set **Dark theme** and **Vietnamese (`vi`)** as the default experience when no saved user preference exists.
- Replaced the wide `@username ×` reply chip in the comment composer bar with inline `@username` input prefill so the Send button is never clipped on narrow screens, and removed the `"Tối đa 2 tầng bình luận"` hint text.

### Fixed
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
