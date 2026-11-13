# Phase 03: Likes, 2-Tier Comments, Reports & Profiles

## Overview
- **Status:** pending | **Priority:** P1 | **Date:** 2026-11-14
- Hoàn thiện tương tác lõi khớp `mock-ui/`: thả tim (chỉ tim, không dislike), `/post/[id]` với comment 2 tầng + thanh nhập dính đáy (`bottom: 0`), xóa bình luận & báo cáo nằm trong action sheet `...` (thẻ nổi), trang cá nhân `/u/[username]`, và follow.

## Key Requirements
- **Like:** Toggle tim per `(userId, postId)`, optimistic UI.
- **2-Tier Comments (`/post/[id]`):**
  - Tầng 1 (`parentId = null`) + Tầng 2 (`parentId = rootId`), chặn tầng 3 ở API (`400`).
  - `bottom-nav` **ẩn** khi vào `/post/[id]`; `.comment-composer-bar` **cố định sát đáy (`bottom: 0`)** với nền mờ.
- **Action Sheet `...` (Raised-card style từ `mock-ui/styles.css`):**
  - **Không** để nút xóa lộ bên ngoài bình luận (tránh bấm nhầm). Mọi thao tác xóa/báo cáo mở từ nút `...`:
    - Trên **bài viết**: chủ bài thấy `Chỉnh sửa bài viết` + `Xóa bài viết`; người khác thấy `Báo cáo bài viết` (đỏ).
    - Trên **bình luận (Tầng 1 & 2)**: **chủ bài viết** hoặc chính chủ bình luận thấy `Xóa`; người khác thấy `Báo cáo bình luận` (đỏ).
- **Reports API:** `POST /api/reports` lưu vào bảng `reports` (`targetType: 'post' | 'comment'`, `postId`, `commentId?`, `reason`).
- **Profile `/u/[username]`:** Avatar, tên, `@username`, bio (sửa được nếu là chính mình), follower/following counts, nút Follow (hoặc nút `Chỉnh sửa hồ sơ` phẳng nền xám nhạt không viền), danh sách bài viết hiển thị trực tiếp ngay dưới header (không thanh tiêu đề thừa).

## Files to Create/Modify
- `src/app/api/posts/[id]/like/route.ts`
- `src/app/api/posts/[id]/comments/route.ts`, `src/app/api/comments/[id]/route.ts` (cho phép `comment.authorId`, `post.authorId`, hoặc `admin` xóa)
- `src/app/api/reports/route.ts`
- `src/app/api/users/[username]/follow/route.ts`, `src/app/api/users/me/route.ts`
- `src/app/post/[id]/page.tsx`, `src/app/u/[username]/page.tsx`
- `src/components/comment-thread.tsx`, `src/components/profile-header.tsx`

## Todo List
- [ ] Like toggle API & optimistic heart button
- [ ] 2-tier comments API + `DELETE /api/comments/[id]` (author | postOwner | admin)
- [ ] `POST /api/reports` + raised-card `MoreSheet` cho cả bài viết & bình luận
- [ ] `/post/[id]` với composer dính đáy & ẩn bottom nav
- [ ] Follow toggle API + `/u/[username]` (flat edit profile button, no redundant section header)

## Success Criteria
- Chủ bài viết xóa được bình luận Tầng 1 & Tầng 2 của người khác trong bài mình qua nút `...`.
- User báo cáo được cả bài viết và bình luận; không có nút xóa lộ bên ngoài comment.
- Reply tầng 3 bị API chặn (`400`).

## Risks
- Trùng `username` khi sửa hồ sơ: bắt lỗi Postgres `UNIQUE` và trả `409 Conflict` rõ ràng.
