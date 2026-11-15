---
title: "marjames (Cortis Fandom Social Web) — Production Plan"
description: "Threads-style private fandom app (max 1,000 users) using Bun, Next.js fullstack, Supabase Postgres, Better Auth, Cloudinary"
status: in_progress
created: 2026-11-14
branch: main
---

# `marjames` — Production Implementation Plan

## Source of Truth (Priority Order)
1. **Visual & Tokens:** `docs/palette-preview.html` (Cortis triad `#FE0000`, `#FDC101`, `#FF7300`, Dark/Light CSS variables).
2. **Product & UX Spec:** `docs/reports/decision-report.md` (18 chốt cứng: Login-gated Google-only, 1,000-user cap, 1 image/post, heart-only, 2-tier comments, owner edit/delete/report, Desktop-only Admin).
3. **Reference UI:** `mock-ui/` (`index.html`, `styles.css`, `app.js`, `admin.html`, `admin.js`) — mọi layout, spacing, i18n (VI/EN), theme, action sheet `...`, `/compose`, `/search`, `/admin` đều bám sát `mock-ui/`.

## Architecture Summary
- **Runtime:** Bun (`bun --bun next dev/build`, `bun test`)
- **Auth:** Better Auth (Google OAuth + `databaseHooks.user.create.before` 1,000-user cap + `role`/`banned` check on every session)
- **DB:** Supabase PostgreSQL via **Prisma ORM (latest)** (`prisma/schema.prisma`, `prismaAdapter`)
- **Media:** Client-side WebP compression (`browser-image-compression`, `< 300 KB`, `max 1200px`) -> Cloudinary

## Production Fullstack Folder Structure
```text
prisma/
└── schema.prisma                   # User, Session, Account, Verification, Post, Comment, Like, Follow, Report
src/
├── app/
│   ├── globals.css                 # Cortis palette tokens (light/dark) từ palette-preview.html
│   ├── layout.tsx                  # Inter font, Theme/Lang provider
│   ├── page.tsx                    # / (Home Feed: All & Following)
│   ├── login/page.tsx              # /login (chỉ marjames + Google button)
│   ├── compose/page.tsx            # /compose (tạo bài & ?edit=[id] sửa bài)
│   ├── search/page.tsx             # /search (kiểu Instagram: 3 recent, @user, posts)
│   ├── post/[id]/page.tsx          # /post/[id] (chi tiết + comment 2 tầng + composer dính đáy)
│   ├── u/[username]/page.tsx       # /u/[username] (profile phẳng, không header thừa)
│   ├── admin/page.tsx              # /admin (Desktop-only >= 1024px)
│   └── api/                        # Next.js Backend Route Handlers (validate -> server logic -> JSON)
│       ├── health/route.ts         # GET /api/health (kiểm tra DB connection thật)
│       ├── auth/[...all]/route.ts  # Better Auth handler
│       ├── upload/route.ts         # POST /api/upload (signed Cloudinary upload)
│       ├── posts/
│       │   ├── route.ts            # GET feed (all|following, cursor), POST create
│       │   └── [id]/
│       │       ├── route.ts        # GET detail, PATCH edit, DELETE post (+ Cloudinary cleanup)
│       │       ├── like/route.ts   # POST toggle heart
│       │       └── comments/route.ts # POST create tier-1 / tier-2 comment
│       ├── comments/[id]/route.ts  # DELETE (commentAuthor | postOwner | admin)
│       ├── reports/route.ts        # POST report post/comment
│       ├── search/route.ts         # GET ?q= (top 3 users + matching posts)
│       ├── users/
│       │   ├── me/route.ts         # PATCH profile (name, username, bio)
│       │   └── [username]/follow/route.ts # POST toggle follow
│       └── admin/                  # Guarded: requireAdmin() (role === 'admin' && !banned)
│           ├── stats/route.ts      # GET 8 metrics + 5-day activity + top posts
│           ├── posts/route.ts      # GET posts list
│           ├── comments/route.ts   # GET comments list (kèm postId gốc)
│           ├── reports/
│           │   ├── route.ts        # GET reports queue
│           │   └── [id]/route.ts   # PATCH action: delete | ban | dismiss
│           └── users/[id]/ban/route.ts # POST toggle ban/unban
├── components/                     # UI components thuần (AppShell, PostCard, MoreSheet, ...)
├── server/                         # Backend-only modules (never imported by Client Components)
│   ├── prisma.ts                   # PrismaClient singleton (Supabase pooler-safe)
│   ├── auth.ts                     # Better Auth (prismaAdapter + 1,000-user cap hook)
│   ├── session.ts                  # requireSession() & requireAdmin() (chặn banned === true)
│   ├── http.ts                     # jsonOk / jsonError / parseBody helpers (no swallowed errors)
│   ├── cloudinary.ts               # Server-side upload signature & destroy helper
│   └── invariants.ts               # Pure business guards (cap check, 2-tier depth, ownership) -> testable via bun test
├── lib/                            # Client/shared helpers (auth-client.ts, compress-image.ts, i18n.ts, constants.ts)
└── types/
    └── domain.ts                   # Shared API/UI DTOs (PostDTO, CommentDTO, ReportDTO)
```

## Minimal Clean Code Rules (Bắt buộc khi code)
1. **Tách ranh giới Backend (`src/server/` + `src/app/api/`):** `route.ts` chỉ parse/validate input và gọi `src/server/`; không viết query DB rải rác trong UI component, không import `src/server/*` vào Client Components.
2. **Type-safe tuyệt đối:** Không dùng `any`; validate mọi input ở boundary API (`400` khi sai, `401` chưa login, `403` bị ban/không đủ quyền, `404` không thấy, `409` trùng username).
3. **Không hardcode magic values:** Mọi giới hạn (`MAX_USERS = 1000`, `MAX_IMAGE_BYTES`, `MAX_POST_LENGTH`, `RECENT_SEARCH_LIMIT = 3`) đặt trong `src/lib/constants.ts` hoặc env vars.
4. **Không nuốt lỗi (`catch {}`):** Mọi API error trả `{ error: string }` với đúng HTTP status qua `src/server/http.ts` và log context phía server (không lộ stack/secret ra client).
5. **Không code thừa / dead weight:** Không `TODO`/`FIXME`, không comment hiển nhiên, không abstraction thừa; dùng thẳng Prisma query.

## Phases

| Phase | Name | Status | File |
| :--- | :--- | :--- | :--- |
| 01 | Scaffold, DB Schema & Better Auth | in_progress | [phase-01-scaffold-db-auth.md](./phase-01-scaffold-db-auth.md) |
| 02 | Palette, AppShell, Media, Posts & Search | pending | [phase-02-media-and-posts.md](./phase-02-media-and-posts.md) |
| 03 | Likes, 2-Tier Comments, Reports & Profiles | pending | [phase-03-interactions-and-profiles.md](./phase-03-interactions-and-profiles.md) |
| 04 | Desktop-Only Admin Dashboard & Verification | pending | [phase-04-admin-and-verification.md](./phase-04-admin-and-verification.md) |
