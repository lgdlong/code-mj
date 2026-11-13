# Phase 04: Desktop-Only Admin Dashboard & Verification

## Overview
- **Status:** pending | **Priority:** P1 | **Date:** 2026-11-14
- Xây trang `/admin` riêng **chỉ hỗ trợ màn hình máy tính (`≥ 1024px`)** bám sát `mock-ui/admin.html` & `mock-ui/admin.js`, kèm toàn bộ Admin APIs và kiểm thử tự động (`bun test`, `tsc`, `build`).

## Key Requirements
- **Desktop-only Guard (`≥ 1024px`):** Màn hình `< 1024px` chỉ hiện thông báo *"Chỉ hỗ trợ trên màn hình máy tính"*, không làm responsive mobile.
- **Role Guard:** Mọi route `/admin` và `/api/admin/*` bắt buộc `requireAdmin()` (`role === 'admin' && !banned`), trả `403` cho user thường.
- **5 khu vực trong `/admin`:**
  1. **Tổng quan:** 8 thẻ thống kê (Thành viên `X/1.000`, Tổng bài viết, Tổng bình luận, Tài khoản bị khóa, Tổng lượt thả tim, Tỉ lệ bài có ảnh, Dung lượng Cloudinary ước tính, Hoạt động 7 ngày) + bảng 5 ngày gần nhất (có cột Tim mới) + Top bài viết tương tác cao (link `/post/[id]`).
  2. **Quản lý bài viết:** Bảng bài viết + tìm kiếm + nút Xóa.
  3. **Quản lý bình luận:** Bảng bình luận + tìm kiếm + **cột Bài viết gốc bấm mở thẳng `/post/[id]`** + nút Xóa.
  4. **Quản lý báo cáo:** Sidebar có badge số báo cáo `Chờ xử lý`; bảng hiển thị loại (`Bài viết` / `Bình luận`), tác giả, nội dung, người báo cáo, lý do, trạng thái + nút **Xem bài** (`/post/[id]`), **Xóa nội dung**, **Khóa user**, **Bỏ qua**.
  5. **Quản lý người dùng:** Bảng thành viên + tìm kiếm + **Khóa / Mở khóa (Ban / Unban)**.

## Files to Create/Modify
- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/posts/route.ts`, `src/app/api/admin/comments/route.ts`
- `src/app/api/admin/reports/route.ts`, `src/app/api/admin/reports/[id]/route.ts` (`delete` | `ban` | `dismiss`)
- `src/app/api/admin/users/[id]/ban/route.ts`
- `src/app/admin/page.tsx` (Desktop-only layout khớp `mock-ui/admin.html`)
- `tests/core-invariants.test.ts` (1,000-user cap, 2-tier comment depth, ownership/post-owner/admin permissions, report resolution)

## Todo List
- [ ] Admin APIs (`/api/admin/stats`, `posts`, `comments`, `reports`, `users/[id]/ban`) với `requireAdmin()`
- [ ] `/admin` Desktop-only UI (5 tabs, search, dark/light, VI/EN)
- [ ] Viết & chạy `bun test` cho các invariants lõi
- [ ] Chạy `bunx tsc --noEmit` & `bun run build`

## Success Criteria
- User thường gọi `/api/admin/*` nhận `403`; user bị ban bị chặn mọi route/API.
- Admin bấm từ Bình luận hoặc Báo cáo mở thẳng được `/post/[id]` gốc và xử lý xóa/ban/bỏ qua thành công.
- `bun test`, `bunx tsc --noEmit`, `bun run build` pass sạch.

## Risks
- Bootstrap Admin đầu tiên: cấu hình `ADMIN_EMAIL` trong `.env` (gán `role = 'admin'` trong `user.create.after`) hoặc chạy SQL `UPDATE "user" SET role = 'admin' WHERE email = '...'`.
