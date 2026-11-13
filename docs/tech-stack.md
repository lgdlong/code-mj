# Tech Stack — Cortis Fandom Social Web

| Layer | Choice | Rationale |
| :--- | :--- | :--- |
| **Runtime & Package Manager** | **Bun** (`1.4.4+`) | Fast install, native TS/script execution, `bun --bun next dev/build`. |
| **Fullstack Framework** | **Next.js (App Router)** + TypeScript | Single repo for UI, Server Actions / Route Handlers, middleware auth guard. |
| **Styling** | **Tailwind CSS** | Rapid replication of Threads single-column layout (`max-w-[620px]`), responsive desktop/mobile nav. |
| **Database** | **Supabase (PostgreSQL)** + **Drizzle ORM** (`postgres` driver) | Managed Postgres with free tier; Drizzle keeps schema/queries type-safe and minimal. |
| **Authentication** | **Better Auth** (`socialProviders.google` + `admin` plugin) | Self-hosted in Next.js API routes; `databaseHooks.user.create.before` enforces hard 1,000-user cap. |
| **Media Storage & Compression** | **Cloudinary** + `browser-image-compression` | Client-side WebP compression (max 1200px, <300KB) before upload; 1 image/post limit preserves 25-credit free tier. |
| **Hosting** | **Vercel** | Zero-config Next.js deployment, free tier. |

## Environment Variables Required
- `DATABASE_URL` (Supabase Postgres connection string)
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
