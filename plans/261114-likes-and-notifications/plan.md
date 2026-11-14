---
title: "Likes Viewer + System Notifications"
description: "Xem ai đã thả tim bài viết (public) + thông báo hệ thống kiểu Facebook (like/comment/reply/follow)"
status: proposed
created: 2026-11-14
branch: main
---

# Plan: Likes Viewer + Notifications

## 1. Scope

| # | Chức năng | Định nghĩa xong |
|---|---|---|
| F1 | **Ai đã thả tim bài viết** | Bấm vào **con số tim** (không phải icon) → bottom sheet danh sách member đã tim, ai đăng nhập cũng xem được, bấm tên → `/u/[username]` |
| F2 | **Thông báo hệ thống** | Chuông ở header + badge chưa đọc; `/notifications` liệt kê: có người **tim bài của mình**, **bình luận bài của mình**, **trả lời bình luận của mình**, **theo dõi mình**; bấm tin → nhảy tới bài/người |

## 2. Quyết định kiến trúc (và phần bị cắt)

| Quyết định | Lý do | Bị cắt |
|---|---|---|
| **F2 không có bảng `Notification`** — activity feed **suy ra** từ `Like` + `Comment` + `Follow` lúc đọc | Không có write hook ở 3 route, không dedupe, không row mồ côi, không lệch dữ liệu. Unlike/unfollow tự biến mất đúng ý Facebook. Đổi lại chỉ cần thêm `UserSetting.notificationsSeenAt` + 2 index | Fan-out write-time, grouping "X và 3 người khác", per-item read state, mention, email/push |
| **Polling 30s**, không WebSocket/SSE | Vercel serverless + ≤1000 user; 1 endpoint `count` mỗi 30s là ~vài chục request/phút | Realtime tức thời (<30s) |
| **Chỉ 1 mốc đã đọc** (`notificationsSeenAt`) | Badge + tint chưa đọc là đủ; mở trang = đọc hết | Mark-read từng tin |
| **Danh sách thông báo tối đa 50 tin gần nhất**, không phân trang | 50 tin cũ hơn là nhiễu; bỏ luôn cursor hợp 3 nguồn (phần dễ sai nhất) | Cuộn vô hạn trong `/notifications` |
| **Không thông báo khi tim bình luận** | Không có trong yêu cầu; thêm sau = thêm 1 nhánh `CommentLike` vào *loadActivity* + *countUnread* (10 dòng) | — |
| F1 dùng **keyset pagination** `(createdAt desc, userId desc)` | 1 bài có thể 1000 lượt tim; cursor `createdAt|userId` không mất dòng trùng giây | — |

## 3. Thay đổi schema (`prisma/schema.prisma`)

```prisma
model UserSetting {
  // ...
  notificationsSeenAt DateTime @default(now())
}

model Like {
  // ...
  @@index([postId, createdAt])
}

model Follow {
  // ...
  @@index([followingId, createdAt])
}
```

Áp dụng: `prisma/sql/notifications.sql` (additive-only) vì `db push` trên DB thật đang chặn bởi drift cũ — nó muốn drop `post."imageUrl"` / `post."imagePublicId"` (12 dòng non-null, cột legacy không còn trong schema, không được code nào đọc). Drop đó là quyết định riêng, không đi kèm feature này:

```bash
bun --env-file=.env x prisma db execute --file prisma/sql/notifications.sql
```

## 4. F1 — Likes Viewer

### API `GET /api/posts/[id]/likes?cursor=`
- `requireSessionUser()` (app login-gated; "public" = mọi member).
- Post không tồn tại → 404.
- Lọc `user: { banned: false }` — like của member bị ban không hiển thị.
- `LIKERS_PAGE_SIZE = 30` (`src/lib/constants.ts`), trả `take + 1` để biết còn trang.
- Cursor: `${createdAt.toISOString()}|${userId}` (client `encodeURIComponent`). Parse lỗi → bỏ cursor.

```ts
where: {
  postId,
  user: { banned: false },
  ...(cursor && {
    OR: [{ createdAt: { lt: cursor.at } },
         { createdAt: cursor.at, userId: { lt: cursor.userId } }],
  }),
},
orderBy: [{ createdAt: "desc" }, { userId: "desc" }],
take: LIKERS_PAGE_SIZE + 1,
select: { userId: true, createdAt: true, user: { select: { username, name, image, role } } },
```

Response: `{ data: { items: LikerDTO[], nextCursor: string | null } }`.

```ts
// src/types/domain.ts
export interface LikerDTO {
  id: string; username: string; name: string;
  image: string | null; role: "user" | "admin"; createdAt: string;
}
```

### UI — `src/components/likes-sheet.tsx` (mới)
- Bottom sheet bằng `.sheet-overlay` / `.sheet-panel` sẵn có (giống `MoreSheet`).
- Mount **bên trong `post-card.tsx`** → feed, profile, post detail dùng chung, không prop-drill.
- Fetch trang đầu khi mở, `nextCursor` → nút "Xem thêm" (không cần IntersectionObserver trong sheet).
- Dòng: `UserAvatar` (export từ `post-card.tsx`) + `name` + `@username`, `Link` tới `/u/[username]`, đóng sheet khi điều hướng.
- Empty: `t("likedByEmpty")`. Header: `t("likedByTitle")`.

### `post-card.tsx` (sửa)
- Tách nút: icon tim vẫn là `<button onClick={onToggleLike}>`; **số đếm** thành `<button className="action-count">` mở sheet (`stopPropagation`).
- State `likesOpen` + `dynamic(() => import("@/components/likes-sheet"), { ssr: false })` (theo convention repo).
- Không đổi props/không đổi caller nào.

## 5. F2 — Notifications

### 5.1 Server module `src/server/notifications.ts` (mới)

`NOTIFICATIONS_LIMIT = 50` (`src/lib/constants.ts`).

```ts
export async function loadActivity(viewerId: string): Promise<ActivityDTO[]>
```
3 query chạy `Promise.all`, mỗi query `take: NOTIFICATIONS_LIMIT` → merge → `sort(createdAt desc)` → `slice(0, 50)`.
(Top-N của hợp phải nằm trong top-N của nguồn, nên cắt cục bộ vẫn đúng.)

- **like** — `prisma.like.findMany({ where: { post: { authorId: viewerId }, userId: { not: viewerId }, user: { banned: false } }, orderBy: { createdAt: "desc" }, take }`, select actor + post `{ id, content, imageUrls }`.
- **comment** — `where: { authorId: { not: viewerId }, author: { banned: false }, OR: [{ post: { authorId: viewerId } }, { parent: { authorId: viewerId } }] }`, select `id, content, createdAt, author, post { id, authorId }, parent { authorId }`.
  → `kind = post.authorId === viewerId ? "comment" : "reply"` (bình luận trên bài của mình thắng "reply").
- **follow** — `where: { followingId: viewerId, follower: { banned: false } }`.

`read = createdAt <= seenAt`, với `seenAt = await getSeenAt(viewerId)`:

```ts
// UserSetting chỉ được tạo lazy bởi PATCH /api/users/me/settings ⇒ phần lớn user chưa có row.
// Fallback `new Date()` chỉ trong RAM thì badge sẽ không bao giờ nhảy (mỗi lần poll lại "now").
// Nên: lần đọc đầu tiên tạo row với mốc = now — chốt "đã xem tới đây" (lịch sử không bị
// tính chưa đọc) và persist để poll sau đếm đúng. Không dùng upsert(update: {}) vì
// @updatedAt sẽ ghi row mỗi 30s cho mỗi user.
async function getSeenAt(userId: string): Promise<Date> {
  const row = await prisma.userSetting.findUnique({
    where: { userId }, select: { notificationsSeenAt: true },
  });
  if (row) return row.notificationsSeenAt;
  try {
    const created = await prisma.userSetting.create({
      data: { userId }, select: { notificationsSeenAt: true },
    });
    return created.notificationsSeenAt;
  } catch (err) {
    // P2002: request poll song song vừa tạo row trước đó → đọc lại.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const again = await prisma.userSetting.findUnique({
        where: { userId }, select: { notificationsSeenAt: true },
      });
      if (again) return again.notificationsSeenAt;
    }
    throw err;
  }
}
```

Dùng chung helper này ở `loadActivity`, `countUnread` và `POST /seen` (set = now).

```ts
export async function countUnread(viewerId: string): Promise<number>
```
3 `count` cùng predicate trên + `createdAt: { gt: seenAt }`, cộng lại. Một comment vừa là "trên bài tôi" vừa "trả lời tôi" chỉ nằm trong **một** query (OR) nên không đếm đôi.

`preview` server-side = `content.slice(0, 80)`; bài chỉ có ảnh → `preview: ""`, client hiện `t("notifImagePost")`.

```ts
// src/types/domain.ts
export type ActivityKind = "like" | "comment" | "reply" | "follow";
export interface ActivityDTO {
  id: string;            // "l:<actor>:<postId>" | "c:<commentId>" | "f:<actor>"
  kind: ActivityKind;
  createdAt: string;
  read: boolean;
  actor: Pick<UserSummaryDTO, "id" | "username" | "name" | "image">;
  postId?: string;
  preview?: string;
  hasImage?: boolean;
}
```

### 5.2 API

| Route | Việc |
|---|---|
| `GET /api/notifications` | `{ items: ActivityDTO[] }` — cùng `loadActivity` |
| `GET /api/notifications/unread` | `{ count }` — poll 30s cho badge; lần poll đầu có thể tạo `UserSetting` row qua `getSeenAt` (1 lần duy nhất) |
| `POST /api/notifications/seen` | `userSetting.upsert({ where: { userId }, create: { userId, notificationsSeenAt: now }, update: { notificationsSeenAt: now } })` → `{ seenAt }` |
| `GET /api/posts/[id]/likes` | F1 (xem §4) |

Không route nào cần `POST` mới ngoài `/seen` → **không sửa** `like/route.ts`, `follow/route.ts`, `comments/route.ts`.

### 5.3 UI

- **`app-shell.tsx`**: thêm `<Link href="/notifications" className="header-icon-btn">` + `Bell` (Phosphor) cạnh icon search, badge số chưa đọc (`9+` khi >9, ẩn khi 0) — `data-theme` tokens `--red`.
- **`src/hooks/use-notifications.ts`** (mới): `useUnreadCount()` = `useQuery({ queryKey: ["notifications","unread"], refetchInterval: UNREAD_POLL_MS /* 30_000 */ })`. TanStack tự dừng `refetchInterval` khi tab ẩn.
- **`src/app/notifications/page.tsx`** (server): `getServerUser()` → redirect `/login`; `loadActivity` → `<NotificationsClient initialItems />`.
- **`src/components/notifications-client.tsx`**: render list, `useEffect` gọi `POST /api/notifications/seen` rồi `invalidateQueries(["notifications","unread"])`. Dòng chưa đọc có class `.unread` (nền `var(--red-soft)`), bấm → `/post/[postId]` hoặc `/u/[actor]`.
- Text không cần nội suy phức tạp: `{actor.username}` (link) + hậu tố i18n:
  - `notifLike` = "đã thả tim bài viết của bạn" / "liked your post"
  - `notifComment` = "đã bình luận bài viết của bạn" / "commented on your post"
  - `notifReply` = "đã trả lời bình luận của bạn" / "replied to your comment"
  - `notifFollow` = "đã theo dõi bạn" / "started following you"
  - thêm `notifications`, `notificationsEmpty`, `notifImagePost`, `likedByTitle`, `likedByEmpty`, `loadMoreBtn`
- CSS thêm (~35 dòng, `globals.css`): `.action-count`, `.header-badge`, `.notif-row`, `.notif-row.unread`, `.notif-row:hover`, `.liker-row`.

## 6. Danh sách file

**Mới (9)**
1. `src/server/notifications.ts`
2. `src/app/api/notifications/route.ts`
3. `src/app/api/notifications/unread/route.ts`
4. `src/app/api/notifications/seen/route.ts`
5. `src/app/api/posts/[id]/likes/route.ts`
6. `src/app/notifications/page.tsx`
7. `src/components/notifications-client.tsx`
8. `src/components/likes-sheet.tsx`
9. `src/hooks/use-notifications.ts`

**Sửa (7)**
1. `prisma/schema.prisma` — `notificationsSeenAt` + 2 index
2. `src/lib/constants.ts` — `NOTIFICATIONS_LIMIT`, `LIKERS_PAGE_SIZE`, `UNREAD_POLL_MS`
3. `src/types/domain.ts` — `LikerDTO`, `ActivityDTO`
4. `src/components/app-shell.tsx` — chuông + badge
5. `src/components/post-card.tsx` — số tim thành nút mở sheet
6. `src/lib/i18n.ts` + `src/app/globals.css` — 10 key VI/EN + CSS
7. `prisma/sql/notifications.sql` — DDL additive (1 column + 2 index)

## 7. Edge cases đã xử lý

- Tự tim/bình luận/follow bài của mình → `authorId != viewerId` loại bỏ, không tự thông báo.
- Post/comment bị xoá → dữ liệu nguồn mất, notification tự mất (không có row rác).
- Unlike / unfollow → tin tương ứng biến mất (khớp Facebook).
- Member bị ban: like/comment/follow của họ bị lọc (`banned: false`), và họ không đăng nhập được.
- User chưa từng có `UserSetting` row (đa số, vì row chỉ tạo khi PATCH settings) → `getSeenAt` tạo row 1 lần với mốc now ⇒ badge 0 lúc bật tính năng, lịch sử không bị đánh dấu chưa đọc; từ đó hoạt động mới đếm đúng. Poll song song không lỗi nhờ bắt `P2002` rồi đọc lại.
- Badge không poll khi tab ẩn (TanStack mặc định), không spam DB.
- Post detail (`showHeader={false}`) không có chuông — chấp nhận; có badge ở mọi trang còn lại.

## 8. Verify

1. `bun --env-file=.env run db:push && bun run typecheck && bun run build`.
2. 2 tài khoản A/B: B tim + bình luận + trả lời + follow bài/comment của A → mở `/notifications` của A thấy đủ 4 loại, badge = 4, mở trang → badge về 0.
3. B bỏ tim → tin "đã thả tim" của B biến mất sau reload.
4. Bài của A có 3 lượt tim → bấm số tim ở feed thấy 3 member; bấm icon tim vẫn toggle like (không mở sheet).
5. Mobile 390px: sheet + list không tràn, `9+` badge không phá header.
