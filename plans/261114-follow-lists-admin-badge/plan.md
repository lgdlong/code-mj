# Plan — Public follower/following lists + admin badge

Scope: (1) anyone can view any profile's followers and following lists, public like Instagram; (2) admin badge (VI: "Quản trị viên") next to the author's name in posts and comments, same as on the profile page.

## Current state (verified)

| Concern | Where | Fact |
|---|---|---|
| Counts only | `src/app/u/[username]/page.tsx:61-63`, `profile-header.tsx:77-85` | profile shows `followersCount`/`followingCount` as plain text; **no list view exists** |
| Pagination pattern to copy | `src/app/api/posts/[id]/likes/route.ts` | keyset cursor `createdAtISO\|userId`, `orderBy [createdAt desc, userId desc]`, `take SIZE+1`, `LIKERS_PAGE_SIZE` |
| Sheet UI to copy | `src/components/likes-sheet.tsx` | bottom-sheet list rows (avatar, name, @username, time), load-more button, dedupe on cursor pages |
| Follow edge | `prisma/schema.prisma` `Follow` | PK `(followerId, followingId)`, index `(followingId, createdAt)` |
| Admin badge today | `profile-header.tsx:44-57` | hard-coded pill "Admin", styled inline, **only place** — posts (`post-card.tsx:80-82`), comments (`comment-thread.tsx:80-82,148-150`) and likes rows show no role |
| `role` is already everywhere needed | DTOs | `author.role` in `PostDTO`, `CommentDTO`, `ReplyDTO`, `LikerDTO` — no API change for the badge |
| Session entry | `getServerUser` / `requireSessionUser` | pages require login; feeds are private to members, consistent with "public" = any signed-in member |

## Decisions

1. **"Public" = any logged-in member.** Every page already redirects to `/login`; the list APIs require a session user. Same visibility as the rest of the app.
2. **One shared component, two queries, one route.** `FollowListSheet` reuses the `LikesSheet` shape; one API route serves both directions via a `kind` param. No new tables, no schema change.
3. **Keyset pagination identical to likers** (`createdAtISO|userId`, desc, size `FOLLOW_PAGE_SIZE = 30`). **Followers of X** = rows with `followingId = X` — served by the existing `(followingId, createdAt)` index, ordered scan, no in-memory sort. **Following of X** = rows with `followerId = X` — PK `(followerId, followingId)` prefix scan, but `createdAt` ordering cannot use it, so ≤1,000 rows are sorted in memory per page: trivial at this cap, revisit with `(followerId, createdAt)` only if the cap ever grows. Cursor = `createdAt desc, <otherId> desc` for both, identical shape to likers.
4. **List order = newest first**, same as likers; no tabs inside the sheet — two entries points ("followers" / "following" count links in `ProfileHeader` open the sheet with the right `kind`).
5. **Badge**: extract the existing pill from `profile-header.tsx` into `src/components/admin-badge.tsx` (`<AdminBadge label={t("adminBadge")} />`), VI = "Quản trị viên", EN = "Admin". Render where `author.role === "admin"`: post author row, comment/reply author row. Uses data already in the DTOs — zero API changes. Likes-sheet rows keep `role` unused for now (avatar list only), noted below.
6. **Self-view allowed**: viewing your own follower/following lists is normal; no special casing.
7. **No mention of follows in notification changes**; this plan does not touch notifications.

## Feature 1 — follower / following sheet

**API** — `src/app/api/users/[username]/follows/route.ts` (GET):

```
GET /api/users/:username/follows?kind=followers|following&cursor=createdAtISO|userId
→ { items: [{ id, username, name, image, role, createdAt }], nextCursor: string|null }
```

```ts
const target = await prisma.user.findUnique({
  where: { username: decodeURIComponent(username) },
  select: { id: true, banned: true },
});
if (!target || target.banned) return jsonError("User not found", 404);

const rows = await prisma.follow.findMany({
  where: {
    ...(kind === "followers" ? { followingId: target.id } : { followerId: target.id }),
    user: { banned: false },      // joined side
    ...(cursor && {
      OR: [
        { createdAt: { lt: cursor.at } },
        { createdAt: cursor.at, <otherKey>: { lt: cursor.userId } },
      ],
    }),
  },
  orderBy: [{ createdAt: "desc" }, { <otherKey>: "desc" }],
  take: FOLLOW_PAGE_SIZE + 1,
  select: { createdAt: true, user: { select: USER_SUMMARY } },
});
```

- `kind=followers`: relation `user` is the **follower**; tiebreak key `followerId`.
- `kind=following`: `user` is the **followed**; tiebreak key `followingId`.
- (Snippets above write `<otherKey>` for the tiebreak; the real code interpolates it per `kind`.)
- One route, param-driven; `USER_SUMMARY` select = `{ id, username, name, image, role }` — same fields `LikerDTO` already carries, so reuse `LikerDTO` as the response type (`createdAt` included).
- Validation: `kind` ∈ {followers, following}, cursor parsed like likers.

**UI** — `src/components/follow-list-sheet.tsx`, near-copy of `LikesSheet` minus the time column need (keep it — `formatRelativeTime` already imported there):

- Props: `{ username, kind, initialCount, onClose }`. Head: `t(kind === "followers" ? "followersSheetTitle" : "followingSheetTitle")` + count.
- Fetch on open, load-more button, same dedupe-on-page pattern.
- `profile-header.tsx`: the two count `<span>`s (followers/following) become `<button>`s opening the sheet. Keep counts bold as now.
- `profile-client.tsx`: state `followSheet: null | "followers" | "following"`, render `<FollowListSheet …>`; count for the open kind is passed as `initialCount`.
- Route page needs no change (counts already in DTO).

**Admin can also see banned? No** — banned users are filtered out of both directions, consistent with likes/comments.

## Feature 2 — admin badge

1. `src/components/admin-badge.tsx`:

```tsx
export function AdminBadge({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px",
      borderRadius: 999, background: "var(--red-soft)", color: "var(--red)" }}>
      {label}
    </span>
  );
}
```
Styles moved verbatim from `profile-header.tsx:45-53`.

2. `profile-header.tsx:44-57`: replace inline pill with `<AdminBadge label={t("adminBadge")} />`.
3. `post-card.tsx:80-82` (author row): `{post.author.role === "admin" && <AdminBadge label={t("adminBadge")} />}` — `role` is already on `PostDTO.author`.
4. `comment-thread.tsx:80-82` and `:148-150` (comment + reply rows): same check against `c.author.role` / `r.author.role`.
5. `src/lib/i18n.ts`: `adminBadge` = VI `"Quản trị viên"`, EN `"Admin"`. (The existing "Admin" pill on profile ignored i18n — that is what this fixes.)
6. `likes-sheet.tsx` rows: `LikerDTO.role` exists but the sheet shows avatar+name only; adding a badge there is one line if wanted — left out of scope, noted.

## Constants

```ts
export const FOLLOW_PAGE_SIZE = 30;   // matches LIKERS_PAGE_SIZE = 30
```

## Files

| File | Change |
|---|---|
| `src/app/api/users/[username]/follows/route.ts` | **new** — GET list (kind=followers/following) |
| `src/components/follow-list-sheet.tsx` | **new** — sheet UI |
| `src/components/profile/profile-header.tsx` | counts → buttons, badge → `AdminBadge` |
| `src/components/profile-client.tsx` | sheet state + render, pass through |
| `src/components/admin-badge.tsx` | **new** — pill component |
| `src/components/post-card.tsx` | badge in author row |
| `src/components/post-detail/comment-thread.tsx` | badge in comment + reply rows |
| `src/lib/constants.ts` | `FOLLOW_PAGE_SIZE` |
| `src/app/globals.css` | reuse `.likes-sheet-panel` classes; one `.follow-sheet-list` alias of `.likes-sheet-list` (no new styles) |
| `src/lib/i18n.ts` | `adminBadge`, `followersSheetTitle`, `followingSheetTitle`, VI/EN |

Sheet reuse note: `FollowListSheet` reuses `.sheet-panel` + `.likes-sheet-panel` (`max-height: min(70vh, 560px)`) so long lists scroll inside the sheet; no new CSS beyond a class alias.

## Verification

1. `bun run typecheck && bun run build`.
2. Open another member's profile → tap "người theo dõi" count → sheet lists their followers newest-first; "đang theo dõi" lists their following; load-more works past 30.
3. Own profile: both sheets work; counts stay correct after follow/unfollow round-trip.
4. Admin account (`role="admin"`): badge shows in profile header **and** next to their name on every post and every comment/reply they wrote; non-admins show nothing.
5. Banned user's follows are invisible in both directions; a banned **profile** 404s before any sheet opens (`u/[username]/page.tsx:50`).
6. VI: badge reads "Quản trị viên"; EN switch: "Admin".
7. Cursor past page 1: no dupes (same dedupe as likers), `nextCursor` null at end.

## Accepted limits

- Lists sorted newest-first with in-memory sort for the following direction at ≤1,000 members (see decision 3); revisit with a `(followerId, createdAt)` index only if the cap ever grows.
- Likes-sheet rows do not show the admin badge (list is avatar-centric); one line to add later.
- No search inside the sheet (Instagram doesn't either at this scale).
