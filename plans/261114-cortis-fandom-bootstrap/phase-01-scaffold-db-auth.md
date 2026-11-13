# Phase 01: Scaffold, Prisma DB, Better Auth & Backend Foundation

## Overview
- **Status:** in_progress | **Priority:** P0 | **Date:** 2026-11-14
- Chuyển tầng DB từ Drizzle sang **Prisma ORM (mới nhất)** + Better Auth `prismaAdapter`, dựng sẵn khung backend `src/server/` + `/api/health`, và cài `@phosphor-icons/react`.

## Key Requirements
- Use `bun` for all installs, scripts, dev, and build.
- Every route except `/login`, `/api/auth/*`, and `/api/health` requires an authenticated, non-banned session.
- Google OAuth only; reject new signups when `prisma.user.count() >= 1000`.
- Prisma schema covers: `User`, `Session`, `Account`, `Verification`, `Post` (with `updatedAt`), `Comment`, `Like`, `Follow`, `Report`.

## Files to Create/Modify
- [x] `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `next.config.ts`, `src/app/api/auth/[...all]/route.ts`, `src/app/login/page.tsx`
- [ ] **Migrate Drizzle -> Prisma:** gỡ `drizzle-orm`, `drizzle-kit`, `postgres`, `src/db/`, `drizzle.config.ts`; cài `prisma` (latest) + `@prisma/client` + `@phosphor-icons/react`
- [ ] `prisma/schema.prisma` — định nghĩa đầy đủ 9 models (`User` với `username`, `bio`, `role`, `banned`; `Session`; `Account`; `Verification`; `Post` với `updatedAt`; `Comment`; `Like`; `Follow`; `Report`)
- [ ] `src/server/prisma.ts` — PrismaClient singleton (hỗ trợ `DATABASE_URL` Transaction pooler + `DIRECT_URL` cho migrate/push)
- [ ] `src/server/auth.ts` — Better Auth dùng `prismaAdapter` + `databaseHooks.user.create.before` (1,000-user cap)
- [ ] `src/server/session.ts` & `src/server/http.ts` — `requireSession()`, `requireAdmin()`, `jsonOk()`, `jsonError()`
- [ ] `src/app/api/health/route.ts` — kiểm tra kết nối DB thật (`SELECT 1`)
- [ ] `src/lib/constants.ts` & `src/lib/auth-client.ts`

## Todo List
- [x] Scaffold Next.js with Bun & configure `.env.example`
- [ ] Replace Drizzle with latest Prisma (`prisma/schema.prisma` + `src/server/prisma.ts`) & push schema (`bunx prisma db push`)
- [ ] Configure Better Auth (`prismaAdapter`) + 1,000-user cap hook & `src/server/session.ts`
- [ ] Add `src/server/http.ts`, `src/app/api/health/route.ts`, `src/lib/constants.ts`
- [ ] Install `@phosphor-icons/react`

## Success Criteria
- `bunx prisma validate`, `bunx tsc --noEmit`, `bun run build` pass.
- `/api/health` trả `200` khi DB sống, `503` khi mất kết nối.
- Unauthenticated or banned visit to `/` redirects to `/login`.

## Risks
- Supabase + Prisma connection pooling: `.env` cần `DATABASE_URL` (port `6543?pgbouncer=true`) cho runtime và `DIRECT_URL` (port `5432`) cho `prisma db push`/`migrate`.
