# Phase 02: Palette, AppShell, Media, Posts & Search

## Overview
- **Status:** pending | **Priority:** P0 | **Date:** 2026-11-14
- Triển khai giao diện bám sát `docs/palette-preview.html` và `mock-ui/`: Cortis tokens (Dark/Light), i18n (VI/EN), `AppShell` (Header + floating pill bottom nav), trang `/compose` riêng (tạo & sửa bài), Cloudinary upload, Home Feed (`For You` / `Following`), và trang `/search` kiểu Instagram.

## Key Requirements
- **Palette & Tokens (`src/app/globals.css`):** Copy biến màu từ `docs/palette-preview.html` & `mock-ui/styles.css` (`#FE0000`, `#FDC101`, `#FF7300`, `--bg`, `--surface`, `--surface-alt`, `--border`, `--nav-bg`).
- **Header & Navigation (`src/components/app-shell.tsx`):**
  - Header trên: trái là wordmark `marjames` (thuần chữ, không khung) + kính lúp `/search`; phải là menu `=` (Giao diện Sáng/Tối, Ngôn ngữ VI/EN, Đăng xuất — **không** hiện mục Quản trị).
  - Bottom nav viên thuốc bo tròn (`backdrop-filter: blur`): 4 nút (Home, `+` Compose, Profile, `=`). **Ẩn** ở `/login`, `/compose`, và `/post/[id]`. Trên desktop (`≥ 768px`) chuyển thành cột menu trái + cột nội dung giữa `max-w-[620px]`.
- **Media & Posts:** Tối đa 1 ảnh/bài, nén WebP trên client (`< 300 KB`, max `1200px`) trước khi upload Cloudinary. Hỗ trợ **tạo bài** và **sửa bài** (`PATCH /api/posts/[id]` kèm dọn ảnh Cloudinary cũ nếu thay/gỡ).
- **Trang `/compose` riêng:** Thanh trên `Hủy · Bài viết mới · Đăng` (hoặc `Lưu` khi `?edit=[id]`), ô nhập tự giãn + icon ảnh bo tròn mềm.
- **Trang `/search` kiểu Instagram:** Thanh tìm + Hủy; khi trống hiện 3 tìm kiếm gần nhất (`localStorage`, nút `X` xóa); khi gõ hiện tối đa 3 thành viên (hỗ trợ `@username`) ở trên + danh sách bài viết khớp từ khóa ở dưới.

## Files to Create/Modify
- `src/app/globals.css`, `src/lib/i18n.ts`, `src/types/domain.ts`
- `src/lib/cloudinary.ts`, `src/lib/compress-image.ts`, `src/app/api/upload/route.ts`
- `src/app/api/posts/route.ts` (`GET`, `POST`), `src/app/api/posts/[id]/route.ts` (`GET`, `PATCH`, `DELETE`)
- `src/app/api/search/route.ts` (`GET ?q=...`)
- `src/components/app-shell.tsx`, `src/components/post-card.tsx`, `src/components/more-sheet.tsx`
- `src/app/page.tsx`, `src/app/compose/page.tsx`, `src/app/search/page.tsx`

## Todo List
- [ ] Cortis palette tokens (`globals.css`), Dark/Light theme + VI/EN i18n context
- [ ] Client-side WebP compression + signed Cloudinary upload & destroy helper
- [ ] `GET/POST /api/posts`, `GET/PATCH/DELETE /api/posts/[id]`, `GET /api/search`
- [ ] `AppShell` (header + floating pill bottom nav + desktop left rail) & `PostCard`
- [ ] Home feed `/`, dedicated `/compose` (create + edit), Instagram-style `/search`

## Success Criteria
- Ảnh 5MB tự nén `< 300 KB` trước khi lên Cloudinary; sửa/xóa bài dọn sạch ảnh cũ trên Cloudinary.
- Giao diện mobile/desktop khớp `mock-ui/index.html` & `docs/palette-preview.html`.

## Risks
- Ảnh rác trên Cloudinary khi sửa/xóa bài: luôn gọi `cloudinary.uploader.destroy(oldPublicId)` trong `PATCH`/`DELETE /api/posts/[id]` khi đổi/xóa ảnh.
