# Brainstorm Report: Cortis Fandom Social Web (Threads-style)

**Ngày:** 2026-11-14  
**Trạng thái:** Đã chốt thiết kế (sẵn sàng chuyển sang `/ck:plan`)

---

## 1. Bài toán & Yêu cầu chốt

Xây dựng mạng xã hội thu nhỏ kiểu **Threads đời đầu** dành riêng cho fandom nhóm nhạc **Cortis**, giới hạn tối đa **1.000 tài khoản**.

| Hạng mục | Quyết định đã chốt |
| :--- | :--- |
| **Quyền xem (Visibility)** | Bắt buộc đăng nhập mới xem được bài viết (private fandom). Chưa login tự chuyển về `/login`. |
| **Đăng nhập & Giới hạn** | Dùng **Better Auth**, chỉ bật **Google Login**. Khóa trần cứng **1.000 user**. |
| **Bài đăng (Post)** | Văn bản + **tối đa 1 ảnh/bài**. |
| **Lưu trữ & Nén ảnh** | **Cloudinary**. Bắt buộc nén ảnh trên trình duyệt (WebP, ~200–300 KB) trước khi upload. |
| **Tương tác** | Chỉ có **thả tim (Like)** kiểu Instagram (đã bỏ Dislike để tránh fanwar/toxic). |
| **Bình luận (Comment)** | **2 tầng** (bình luận gốc + trả lời tầng 2). |
| **Trang cá nhân & Follow** | Mỗi user có trang `/u/[username]` hiển thị toàn bộ bài đã đăng, bio, số follower/following, nút Follow. |
| **Kiểm duyệt (Admin)** | Có tài khoản **Admin** xóa bài, xóa comment, khóa (ban) tài khoản vi phạm. |
| **Giao diện (UI/UX)** | Lấy bố cục từ **Threads** (`threads.com`): cột giữa ~620px, menu trái (desktop) / đáy (mobile), sau đó tự chỉnh riêng. |

---

## 2. Các phương án đã đánh giá

| Phương án | Stack | Ưu điểm | Nhược điểm | Kết quả |
| :--- | :--- | :--- | :--- | :--- |
| **A. All-in-one Supabase** | Next.js + Supabase (Auth, DB, Storage) | Nhanh, ít cấu hình | Free storage 1 GB, bandwidth tải ảnh 5 GB/tháng rất dễ hết | Bị loại phần Auth & Storage |
| **B. Next.js + Better Auth + Postgres + Cloudinary** | Next.js + Better Auth + Neon/Supabase PG + Cloudinary | Auth kiểm soát trực tiếp trong code (dễ chặn 1.000 user), UI/upload đơn giản | Cloudinary Free (25 credits/tháng) có thể chạm ngưỡng nếu xem ảnh quá nhiều | **Đã chọn** (kèm nén ảnh client-side) |
| **C. Tự thuê VPS** | VPS + PocketBase/Node + ổ cứng | Chủ động 100% dung lượng | Tốn phí tháng, phải tự cài/backup/bảo mật | Bị loại |

---

## 3. Kiến trúc giải pháp chốt

### Tech Stack
- **Frontend & API:** Next.js (App Router) + Tailwind CSS (deploy Vercel).
- **Auth:** **Better Auth** (`socialProviders.google`) + **Admin plugin** (hoặc `role` & `isBanned` trên `user`).
- **Database:** PostgreSQL (Neon hoặc Supabase), kết nối qua Drizzle ORM (hoặc Prisma).
- **Media:** `browser-image-compression` (client-side) -> **Cloudinary**.

### Database Schema (5 bảng cốt lõi)
1. **`user`** (Better Auth + mở rộng): `id`, `name`, `username`, `email`, `image`, `bio`, `role` (`'user' | 'admin'`), `banned`, `createdAt`.
2. **`session` / `account` / `verification`**: Bảng chuẩn của Better Auth.
3. **`posts`**: `id`, `authorId`, `content`, `imageUrl`, `imagePublicId`, `createdAt`.
4. **`comments`**: `id`, `postId`, `authorId`, `parentId` (nullable — chỉ cho phép 2 tầng), `content`, `createdAt`.
5. **`likes`**: `(userId, postId)` — khóa chính kép.
6. **`follows`**: `(followerId, followingId)` — khóa chính kép.

### Các màn hình chính
- `/login`: Landing đơn giản + 1 nút **Đăng nhập với Google**.
- `/`: Feed 2 tab (**Tất cả** / **Đang theo dõi**) + khung đăng bài nhanh (chữ + 1 ảnh).
- `/post/[id]`: Chi tiết bài viết + comment 2 tầng.
- `/u/[username]`: Trang cá nhân + danh sách bài của user + nút Follow / Sửa hồ sơ.
- `/admin` (hoặc nút thao tác trực tiếp cho Admin): Xóa bài, xóa comment, ban user.

---

## 4. Rủi ro & Điểm cần lưu ý khi triển khai

1. **Hạn mức Cloudinary Free (25 credits/tháng ≈ 25 GB bandwidth + storage):**
   - *Giảm thiểu:* Nén ảnh tối đa ở client trước khi upload (max-width 1200px, WebP < 300 KB). Tách riêng hàm upload để dễ đổi sang Cloudflare R2 nếu traffic vượt ngưỡng.
2. **Race condition khi chạm mốc 1.000 user:**
   - *Giảm thiểu:* Dùng `databaseHooks.user.create.before` của Better Auth kiểm tra `COUNT(*) < 1000` (hoặc transaction/lock nhẹ) trước khi tạo user mới.
3. **Comment quá 2 tầng:**
   - *Giảm thiểu:* Validate ở API backend: nếu `parentId` trỏ tới 1 comment đã có `parentId !== null` thì từ chối (hoặc tự động gắn về `parentId` gốc).
4. **Biến môi trường bắt buộc:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_SECRET`, `DATABASE_URL`, `CLOUDINARY_*`.

---

## 5. Tiêu chí nghiệm thu (MVP)
- Khách chưa đăng nhập không xem được bất kỳ bài viết/hồ sơ nào.
- Đăng nhập Google thành công; user thứ 1.001 bị chặn.
- Đăng bài (chữ + 1 ảnh đã nén) hiển thị đúng trên feed và trang cá nhân.
- Thả tim, comment 2 tầng, follow hoạt động đúng và cập nhật số đếm.
- Admin xóa được bài/comment và ban được user.

---

## 6. Bước tiếp theo
- Chạy `/ck:plan` để tách phase code chi tiết (Setup Next.js + DB + Better Auth -> Cloudinary upload -> Feed/Post/Comment/Follow -> Admin & Polish UI Threads).
