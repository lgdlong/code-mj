# Decision Report: `marjames` (Cortis Fandom Social Web)

**Ngày tổng hợp:** 2026-11-14  
**Thương hiệu trên giao diện:** `marjames` (chữ wordmark thuần, không khung/logo vuông)  
**Repo:** `https://github.com/lgdlong/code-mj.git`

---

## 1. Bối cảnh & Mục tiêu sản phẩm

Xây dựng mạng xã hội thu nhỏ kiểu **Threads đời đầu** dành riêng cho fandom nhóm nhạc **Cortis**, tối đa **1.000 tài khoản**, ưu tiên trải nghiệm **trên điện thoại trước (Mobile-first)** và giữ mọi thứ tối giản, gọn nhẹ.

---

## 2. Toàn bộ quyết định & lưu ý đã chốt (theo trình tự từ đầu đến nay)

### A. Mô hình & Quyền truy cập
1. **Bắt buộc đăng nhập mới xem được bài (Login-gated):** Không public cho khách vãng lai; chưa đăng nhập tự chuyển về `/login`.
2. **Chỉ chấp nhận Google Login:** Ai có Google đều có thể tự đăng ký/đăng nhập, nhưng chỉ bật duy nhất nút **Tiếp tục bằng Google** (dùng **Better Auth**).
3. **Trần cứng 1.000 thành viên & Username tự động:**
   - Đếm số lượng tài khoản ở hook `databaseHooks.user.create.before`; đạt `1.000` thì chặn tạo tài khoản mới.
   - Lần đầu đăng nhập Google tự sinh **username ngẫu nhiên** (không bắt nhập khi login); user có sẵn **1 lượt đổi username miễn phí ngay lần đầu**, sau đó giới hạn **mỗi 30 ngày (1 tháng) đổi 1 lần** (`usernameChangedAt`).
4. **Màn hình `/login` tối giản tuyệt đối:** Chỉ hiển thị wordmark **`marjames`** và nút Google Login; không hiển thị text thừa về số lượng thành viên, fandom hay giới hạn ảnh.

### B. Bài đăng, Hình ảnh & Tương tác
5. **Mỗi bài tối đa 1 ảnh + văn bản:** Không cho đăng nhiều ảnh/video để tiết kiệm dung lượng và đúng chất tối giản.
6. **Lưu trữ & Nén ảnh:** Dùng **Cloudinary**; bắt buộc **nén ảnh ngay trên trình duyệt** (`browser-image-compression`, WebP, `max-width: 1200px`, `< 300 KB`) trước khi upload để tránh chạm hạn mức 25 credits/tháng.
7. **Chỉ có nút Thả tim (Like) kiểu Instagram:** Đã **bỏ Dislike** để tránh anti-fan phá và hạn chế toxic trong cộng đồng.
8. **Comment đơn giản 2 tầng:** Bình luận gốc (Tầng 1) + trả lời trực tiếp (Tầng 2), không lồng tầng 3+.
9. **Trang cá nhân (`/u/[username]`) & Follow:**
   - Hiển thị Avatar, tên, `@username`, bio, số người theo dõi (`Following` / `Followers`), nút **Follow** (hoặc **Chỉnh sửa hồ sơ** dạng nút xám nhạt không viền nếu là chính mình).
   - Danh sách bài viết của user hiển thị trực tiếp ngay dưới phần thông tin hồ sơ (bỏ thanh tiêu đề thừa).
10. **User tự quản lý nội dung của chính mình:**
    - **Chỉnh sửa bài viết** sau khi đăng (mở lại trang soạn thảo với chữ + ảnh hiện tại, nút **Lưu**).
    - **Xóa bài viết** của chính mình (menu `...` trên bài mình chỉ hiện Sửa / Xóa; bài người khác hiện Báo cáo).
    - **Xóa bình luận không phù hợp trong bài viết của mình** (đưa nút xóa vào menu **ba chấm `...`** của từng bình luận thay vì để lộ bên ngoài để tránh bấm nhầm; áp dụng cho cả bình luận Tầng 1 và Tầng 2; người viết bình luận cũng tự xóa được).
    - **Báo cáo nội dung:** User có thể **báo cáo bài viết hoặc bình luận** qua nút `...` để gửi lên Admin xem xét.

### C. Giao diện & Bố cục UX (lấy từ Threads & Instagram, Mobile-first)
11. **Thương hiệu & Icon:**
    - Wordmark **`marjames`** viết thường, thuần chữ, không dùng khung vuông/huy hiệu bao quanh.
    - Icon đồng bộ nét đều (`stroke-width: 1.8–1.9`, bo tròn) theo phong cách Threads/Instagram (Phosphor Icons + SVG bo tròn chuẩn Threads, bỏ icon tự chế vuông góc).
    - Bảng màu Cortis (`#FE0000`, `#FDC101`, `#FF7300`), hỗ trợ **Dark / Light theme**, song ngữ **Tiếng Việt (ưu tiên) / Tiếng Anh**.
12. **Header trên & Điều hướng:**
    - **Header trên:** Bên trái chỉ có `marjames` + icon **kính lúp tìm kiếm**; bên phải là icon **2 gạch (`=`)** mở dropdown menu (Giao diện, Ngôn ngữ, Đăng xuất — **không** hiện mục Quản trị trong menu của user).
    - **Thanh điều hướng dưới đáy (Mobile):** Dạng viên thuốc bo tròn trôi nổi (`backdrop-filter: blur`) gồm 4 nút: **Trang chủ**, **Đăng bài** (icon `+` vuông bo tròn nét đều), **Trang cá nhân**, **Menu (`=`)**. Trên desktop (`≥ 768px`) chuyển thành cột menu bên trái, nội dung căn giữa `max-width: 620px`.
13. **Trang Đăng bài riêng (không dùng modal):**
    - Thanh trên: `Hủy` bên trái · `Bài viết mới` ở giữa · nút `Đăng` (hoặc `Lưu` khi sửa) bên phải.
    - Nội dung: Avatar + `username` + ô nhập tự giãn `Có gì mới?` + icon đính kèm ảnh bo tròn mềm ngay bên dưới.
14. **Trang Tìm kiếm (`/search`) kiểu Instagram:**
    - Thanh tìm kiếm trên cùng + nút `Hủy`.
    - Khi chưa gõ: hiển thị **3 mục tìm kiếm gần nhất** (từ khóa hoặc `@username`, có nút `X` xóa từng mục).
    - Khi nhập từ khóa: phía trên hiện tối đa **3 thành viên** khớp tên/`username` (hỗ trợ gõ `@username` để tìm chính xác theo username); phía dưới hiện **toàn bộ bài viết** có nội dung chứa từ khóa.

### D. Trang Admin riêng (Desktop-only)
15. **Trang Admin tách biệt (`admin.html` / `/admin`), chỉ hỗ trợ màn hình máy tính (`≥ 1024px`):**
    - Mở trên màn hình nhỏ hơn `1024px` chỉ hiện thông báo yêu cầu dùng máy tính (không tốn công làm responsive mobile cho Admin).
16. **Quản lý nội dung, báo cáo & thành viên:**
    - **Quản lý bài viết:** Xem tác giả, nội dung, ảnh thumbnail, lượt tương tác, xóa bài.
    - **Quản lý bình luận:** Bắt buộc **liên kết mỗi bình luận với bài viết gốc** để Admin bấm vào xem ngay bài viết gốc đó; hỗ trợ xóa bình luận (Tầng 1 & Tầng 2).
    - **Quản lý báo cáo:** Tab riêng nhận báo cáo **bài viết** và **bình luận** từ user; Admin bấm **Xem bài** để tự kiểm tra rồi quyết định **Xóa nội dung**, **Khóa user**, hoặc **Bỏ qua**.
    - **Quản lý người dùng:** Xem `@username`, vai trò, số bài, trạng thái hoạt động, nút **Khóa / Mở khóa (Ban / Unban)**.
17. **Thống kê chi tiết:**
    - Số thành viên (`X / 1.000`), tổng bài viết, tổng bình luận, số tài khoản bị khóa, **tổng lượt thả tim**, **tỉ lệ bài có ảnh**, **dung lượng Cloudinary ước tính**, **số thành viên hoạt động 7 ngày**.
    - Bảng thống kê theo ngày (bài mới, bình luận mới, **tim mới**, thành viên mới) và bảng **Top bài viết tương tác cao** (kèm link xem bài).

### E. Tech Stack & Hạ tầng
18. **Runtime & Stack:** Dùng **Bun** làm runtime toàn bộ, **Next.js (App Router) fullstack** + **Tailwind CSS**, **Better Auth** (Google OAuth + Prisma Adapter), **PostgreSQL (Supabase)** qua **Prisma ORM (mới nhất)**, và **Cloudinary** (kèm `browser-image-compression`).

---

## 3. Rủi ro chính cần theo dõi khi triển khai thật

| Rủi ro | Mức độ | Cách xử lý |
| :--- | :--- | :--- |
| **Cloudinary Free hết 25 credits/tháng** nếu 1.000 fan xem ảnh nhiều | Cao | Ép nén client-side (`WebP`, `< 300 KB`, max `1200px`), 1 ảnh/bài; tách gọn helper upload để sẵn sàng đổi sang Cloudflare R2 nếu cần. |
| **Chặn đúng 1.000 user khi đăng ký đồng thời** | Trung bình | Kiểm tra `COUNT(*) < 1000` trong `databaseHooks.user.create.before` của Better Auth. |
| **Triển khai Fullstack (`src/`) & Kết nối thật** | Đã xong | Toàn bộ `src/` (Prisma 7 + Better Auth + Cloudinary + UI mobile-first + Admin desktop-only) đã được đồng bộ với `mock-ui/`, đẩy schema lên Supabase và verify `tsc --noEmit` + `next build`. |
