# Tech Stack — Cortis Fandom Social Web

| Layer | Choice | Rationale |
| :--- | :--- | :--- |
| **Runtime & Package Manager** | **Bun** (`1.4.4+`) | Fast install, native TS/script execution, `bun --bun next dev/build`. |
| **Fullstack Framework** | **Next.js (App Router)** + TypeScript | Single repo for UI, Server Actions / Route Handlers, middleware auth guard. |
| **Styling** | **Tailwind CSS** | Rapid replication of Threads single-column layout (`max-w-[620px]`), responsive desktop/mobile nav. |
| **Database** | **Supabase (PostgreSQL)** + **Prisma** (`@prisma/adapter-pg`) | Managed Postgres with free tier; Prisma migrations and typed client for schema/queries. |
| **Authentication** | **Better Auth** (`socialProviders.google` + `admin` plugin) | Self-hosted in Next.js API routes; `databaseHooks.user.create.before` enforces hard 1,000-user cap. |
| **Media Storage & Compression** | **Cloudinary** + `sharp` (images), **Cloudflare R2** (video) | Images: originals kept under 4 MB, one server-side `sharp` WebP pass (1600px q88) only when needed. Video: presigned `PUT` straight to R2 (zero egress), MP4/MOV H.264 ≤ 60 s / 50 MB. |
| **Hosting** | **Vercel** | Zero-config Next.js deployment, free tier. |

## Environment Variables Required
- `DATABASE_URL` (Supabase Postgres connection string; pooler URL via `?pgbouncer=true`)
- `DIRECT_URL` (Supabase direct `:5432` URL used by Prisma CLI for `db:push`/`db:generate`)
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` (video)
