# Research Report: Giữ Supabase Free Tier không bị tự động khóa (Auto-Pause)

**Ngày:** 2026-11-14  
**Phạm vi:** Giải pháp ổn định nhất, miễn phí 0đ để chống Supabase Free Plan tự pause sau 7 ngày không hoạt động, phù hợp stack Next.js + Prisma + Vercel + GitHub (`lgdlong/code-mj`).

---

## 1. Executive Summary

- **Nguyên nhân:** Supabase Free Plan tự động **pause project sau 7 ngày** không có đủ hoạt động database từ người dùng (`user database activity`).
- **Điểm mấu chốt thực tế:** Chỉ ping `/auth/v1/health` hoặc `SELECT 1` không phải lúc nào cũng được tính là hoạt động bảng dữ liệu thực. Cần chạy **truy vấn thật vào bảng người dùng** (ví dụ `SELECT count(*) FROM "user"`, tức `prisma.user.count()`).
- **Giải pháp đã áp dụng cho dự án:**
  1. Cập nhật `GET /api/health` (`src/app/api/health/route.ts`) từ `SELECT 1` sang `prisma.user.count()`.
  2. Thêm **Vercel Cron** (`vercel.json`) gọi `/api/health` mỗi tuần 2 lần (`0 3 * * 1,4`).
  3. Thêm **GitHub Actions** (`.github/workflows/keep-alive.yml`) dự phòng chạy mỗi 3 ngày (kích hoạt khi set repo variable `APP_HEALTH_URL`).

---

## 2. So sánh các giải pháp phổ biến trên mạng

| Giải pháp | Cách hoạt động | Chi phí | Ưu điểm | Nhược điểm / Giới hạn |
| :--- | :--- | :--- | :--- | :--- |
| **1. Vercel Cron (`vercel.json`)** *(Khuyên dùng chính)* | Vercel tự gọi `GET /api/health` theo lịch cron | 0đ (Hobby) | Không cần dịch vụ ngoài, không bị tắt sau 60 ngày | Hobby giới hạn tối đa 1 cron/project, tần suất tối đa 1 lần/ngày (đủ dùng) |
| **2. GitHub Actions (`schedule`)** *(Dự phòng)* | Runner GitHub gọi `curl` vào `/api/health` mỗi 3 ngày | 0đ | Chạy độc lập với Vercel, có nút chạy tay `workflow_dispatch` | GitHub tự tắt cron nếu repo không có commit mới trong 60 ngày |
| **3. UptimeRobot / cron-job.org** | Dịch vụ ngoài ping HTTP `/api/health` | 0đ | Có email cảnh báo khi web sập | Phải tạo và quản lý thêm tài khoản ngoài |

---

## 3. Thay đổi đã áp dụng trong repo

1. **`src/app/api/health/route.ts`:** Đổi sang `await prisma.user.count()` để đảm bảo Supabase ghi nhận truy vấn thực trên bảng `user`.
2. **`vercel.json`:** Lịch `0 3 * * 1,4` (03:00 UTC Thứ 2 & Thứ 5 hàng tuần) gọi `/api/health`.
3. **`.github/workflows/keep-alive.yml`:** Workflow dự phòng chạy mỗi 3 ngày (`0 4 */3 * *`); khi deploy xong lên Vercel, vào GitHub Repo → **Settings → Secrets and variables → Actions → Variables** thêm `APP_HEALTH_URL = https://<ten-app>.vercel.app/api/health`.

---

## 4. Nguồn tham khảo

- [Project Pausing | Supabase Docs](https://supabase.com/docs/guides/platform/free-project-pausing)
- [travisvn/supabase-pause-prevention (GitHub)](https://github.com/travisvn/supabase-pause-prevention)
- [ROTEMIL95/supabase-keep-alive (GitHub)](https://github.com/ROTEMIL95/supabase-keep-alive)
- [supabase free-tier keepalive with real postgres queries (Gist)](https://gist.github.com/zaydiscold/30a534efaf13821e91c041ae5eaa9fdd)
- [How to Keep Your Supabase Free Project Active with GitHub Actions (DEV)](https://dev.to/krishna-builds-dev/how-to-keep-your-supabase-free-project-active-no-cost-cron-with-github-actions-1nnd)
